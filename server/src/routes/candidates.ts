import { Router, Request, Response, NextFunction } from 'express';
import { Candidate } from '../models';
import { authenticateAdmin } from '../middleware/auth';
import { uploadCandidatePhoto } from '../middleware/upload';
import { createAuditLog } from '../services/auditService';

const router = Router();

router.get('/election/:electionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidates = await Candidate.find({ electionId: req.params.electionId }).sort({ position: 1, fullName: 1 });
    res.json(candidates);
  } catch (error) { next(error); }
});

router.post('/', authenticateAdmin, uploadCandidatePhoto.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, manifesto, slogan, faculty, department, position, electionId } = req.body;
    const candidate = await Candidate.create({
      fullName, manifesto, slogan, faculty, department, position, electionId,
      photo: req.file ? `/uploads/candidates/${req.file.filename}` : '',
    });
    await createAuditLog('CANDIDATE_ADDED', req.user.email, 'admin', { candidateId: candidate._id, name: fullName, position, electionId }, req.ip || '', req.headers['user-agent'] || '');
    res.status(201).json(candidate);
  } catch (error) { next(error); }
});

router.put('/:id', authenticateAdmin, uploadCandidatePhoto.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates: any = { ...req.body };
    if (req.file) updates.photo = `/uploads/candidates/${req.file.filename}`;
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
    await createAuditLog('CANDIDATE_UPDATED', req.user.email, 'admin', { candidateId: candidate._id }, req.ip || '', req.headers['user-agent'] || '');
    res.json(candidate);
  } catch (error) { next(error); }
});

router.delete('/:id', authenticateAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
    res.json({ message: 'Candidate deleted' });
  } catch (error) { next(error); }
});

export default router;


