import { Router, Request, Response, NextFunction } from 'express';
import { EligibleVoter } from '../models';
import { authenticateAdmin } from '../middleware/auth';
import { uploadVoterFile } from '../middleware/upload';
import { parseVoterFile } from '../services/voterParser';
import { createAuditLog } from '../services/auditService';

const router = Router();

router.post('/upload', authenticateAdmin, uploadVoterFile.single('voterFile'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ message: 'Voter file required' }); return; }
    const result = await parseVoterFile(req.file.path);
    if (result.records.length === 0) { res.status(400).json({ message: 'No valid records', errors: result.errors }); return; }
    const importBatchId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    let inserted = 0, duplicates = 0;
    for (const record of result.records) {
      try {
        await EligibleVoter.findOneAndUpdate({ studentId: record.studentId, email: record.email }, { $set: { ...record, importBatchId } }, { upsert: true, new: true });
        inserted++;
      } catch (err: any) { if (err.code === 11000) duplicates++; }
    }
    await createAuditLog('VOTERS_IMPORTED', req.user.email, 'admin', { totalRows: result.totalRows, inserted, duplicates, importBatchId }, req.ip || '', req.headers['user-agent'] || '');
    res.json({ message: 'Imported successfully', stats: { totalRows: result.totalRows, validRecords: result.records.length, inserted, duplicates, parseErrors: result.errors, importBatchId } });
  } catch (error) { next(error); }
});

router.get('/', authenticateAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, faculty, department, search } = req.query;
    const filter: any = { isActive: true };
    if (faculty) filter.faculty = faculty;
    if (department) filter.department = department;
    if (search) { filter.$or = [{ studentId: { $regex: search, $options: 'i' } }, { fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]; }
    const total = await EligibleVoter.countDocuments(filter);
    const voters = await EligibleVoter.find(filter).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ voters, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
});

router.get('/stats', authenticateAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await EligibleVoter.countDocuments({ isActive: true });
    const voted = await EligibleVoter.countDocuments({ isActive: true, hasVoted: true });
    const byFaculty = await EligibleVoter.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$faculty', total: { $sum: 1 }, voted: { $sum: { $cond: ['$hasVoted', 1, 0] } } } }, { $sort: { total: -1 } }]);
    res.json({ total, voted, notVoted: total - voted, participationRate: total > 0 ? ((voted / total) * 100).toFixed(1) : 0, byFaculty });
  } catch (error) { next(error); }
});

router.get('/faculties', async (_req: Request, res: Response, next: NextFunction) => {
  try { const faculties = await EligibleVoter.distinct('faculty', { isActive: true }); res.json(faculties); } catch (error) { next(error); }
});

export default router;


