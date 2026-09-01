import { Router, Request, Response, NextFunction } from 'express';
import { Election, Vote, EligibleVoter, Candidate, AuditLog } from '../models';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticateAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const totalVoters = await EligibleVoter.countDocuments({ isActive: true });
    const totalVoted = await EligibleVoter.countDocuments({ isActive: true, hasVoted: true });
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    const closedElections = await Election.countDocuments({ status: 'closed' });
    const totalVotes = await Vote.countDocuments();
    const recentActivity = await AuditLog.find().sort({ timestamp: -1 }).limit(20);
    res.json({ totalVoters, totalVoted, totalElections, activeElections, closedElections, totalVotes, participationRate: totalVoters > 0 ? ((totalVoted / totalVoters) * 100).toFixed(1) : 0, recentActivity });
  } catch (error) { next(error); }
});

// GET /api/analytics/election/:id
router.get('/election/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) { res.status(404).json({ message: 'Election not found' }); return; }
    const facultyTurnout = await Vote.aggregate([{ $match: { electionId: election._id } }, { $group: { _id: '$voterFaculty', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const deptTurnout = await Vote.aggregate([{ $match: { electionId: election._id } }, { $group: { _id: { faculty: '$voterFaculty', dept: '$voterDepartment' }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const hourlyVotes = await Vote.aggregate([{ $match: { electionId: election._id } }, { $group: { _id: { $hour: '$submittedAt' }, count: { $sum: 1 } } }, { $sort: { '_id': 1 } }]);
    res.json({ election: { title: election.title, status: election.status, totalEligible: election.totalEligibleVoters, totalVotes: election.totalVotesCast, participationRate: election.totalEligibleVoters > 0 ? ((election.totalVotesCast / election.totalEligibleVoters) * 100).toFixed(1) : 0 }, facultyTurnout, deptTurnout, hourlyVotes });
  } catch (error) { next(error); }
});

// GET /api/analytics/audit-logs
router.get('/audit-logs', authenticateAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, action, search } = req.query;
    const filter: any = {};
    if (action) filter.action = action;
    if (search) { filter.$or = [{ performedBy: { $regex: search, $options: 'i' } }, { action: { $regex: search, $options: 'i' } }]; }
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ logs, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
});

export default router;


