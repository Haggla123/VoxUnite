import { Router, Request, Response, NextFunction } from 'express';
import { Election, Candidate, Vote, EligibleVoter } from '../models';
import { authenticateAdmin } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';
import { uploadBanner } from '../middleware/upload';

const router = Router();

// GET /api/elections - List all elections
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, faculty } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (faculty) filter.facultyScope = { $in: [faculty, 'All'] };

    const elections = await Election.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email');

    res.json(elections);
  } catch (error) { next(error); }
});

// GET /api/elections/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!election) {
      res.status(404).json({ message: 'Election not found' });
      return;
    }

    res.json(election);
  } catch (error) { next(error); }
});

// POST /api/elections - Create election (admin only)
router.post('/', authenticateAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      facultyScope,
      startDate,
      endDate,
      rules,
      positions,
    } = req.body;

    // Count eligible voters for scope
    let voterFilter: any = { isActive: true };
    if (facultyScope && facultyScope.length > 0 && !facultyScope.includes('All')) {
      voterFilter.faculty = { $in: facultyScope };
    }
    const totalEligibleVoters = await EligibleVoter.countDocuments(voterFilter);

    const election = await Election.create({
      title,
      description,
      facultyScope: facultyScope || ['All'],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rules: rules || [],
      positions: positions || [],
      totalEligibleVoters,
      createdBy: req.adminId,
    });

    await createAuditLog(
      'ELECTION_CREATED',
      req.user.email,
      'admin',
      { electionId: election._id, title },
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    res.status(201).json(election);
  } catch (error) { next(error); }
});

// PUT /api/elections/:id - Update election (admin only)
router.put('/:id', authenticateAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      res.status(404).json({ message: 'Election not found' });
      return;
    }

    if (election.status === 'closed') {
      res.status(400).json({ message: 'Cannot modify a closed election' });
      return;
    }

    const updates = req.body;
    // Recalculate eligible voters if scope changes
    if (updates.facultyScope) {
      let voterFilter: any = { isActive: true };
      if (!updates.facultyScope.includes('All')) {
        voterFilter.faculty = { $in: updates.facultyScope };
      }
      updates.totalEligibleVoters = await EligibleVoter.countDocuments(voterFilter);
    }

    const updated = await Election.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    await createAuditLog(
      'ELECTION_UPDATED',
      req.user.email,
      'admin',
      { electionId: req.params.id, updates: Object.keys(updates) },
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    res.json(updated);
  } catch (error) { next(error); }
});

// POST /api/elections/:id/activate
router.post('/:id/activate', authenticateAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      res.status(404).json({ message: 'Election not found' });
      return;
    }

    if (election.status !== 'draft' && election.status !== 'scheduled') {
      res.status(400).json({ message: 'Only draft or scheduled elections can be activated' });
      return;
    }

    // Verify candidates exist
    const candidateCount = await Candidate.countDocuments({ electionId: election._id });
    if (candidateCount === 0) {
      res.status(400).json({ message: 'Cannot activate election without candidates' });
      return;
    }

    election.status = 'active';
    election.startDate = new Date();
    await election.save();

    await createAuditLog(
      'ELECTION_ACTIVATED',
      req.user.email,
      'admin',
      { electionId: election._id, title: election.title },
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('election:activated', { electionId: election._id, title: election.title });
    }

    res.json({ message: 'Election activated', election });
  } catch (error) { next(error); }
});

// POST /api/elections/:id/close
router.post('/:id/close', authenticateAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      res.status(404).json({ message: 'Election not found' });
      return;
    }

    if (election.status !== 'active') {
      res.status(400).json({ message: 'Only active elections can be closed' });
      return;
    }

    election.status = 'closed';
    election.endDate = new Date();
    await election.save();

    await createAuditLog(
      'ELECTION_CLOSED',
      req.user.email,
      'admin',
      { electionId: election._id, title: election.title, totalVotes: election.totalVotesCast },
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('election:closed', { electionId: election._id, title: election.title });
    }

    res.json({ message: 'Election closed', election });
  } catch (error) { next(error); }
});

// PUT /api/elections/:id/results-mode
router.put('/:id/results-mode', authenticateAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mode } = req.body;
    if (!['safe', 'live'].includes(mode)) {
      res.status(400).json({ message: 'Mode must be "safe" or "live"' });
      return;
    }

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { resultsVisibility: mode },
      { new: true }
    );

    if (!election) {
      res.status(404).json({ message: 'Election not found' });
      return;
    }

    await createAuditLog(
      'RESULTS_MODE_CHANGED',
      req.user.email,
      'admin',
      { electionId: req.params.id, mode },
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('election:resultsMode', { electionId: election._id, mode });
    }

    res.json({ message: `Results mode set to ${mode}`, election });
  } catch (error) { next(error); }
});

// POST /api/elections/:id/banner
router.post(
  '/:id/banner',
  authenticateAdmin,
  uploadBanner.single('banner'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Banner image is required' });
        return;
      }

      const election = await Election.findByIdAndUpdate(
        req.params.id,
        { banner: `/uploads/banners/${req.file.filename}` },
        { new: true }
      );

      res.json({ message: 'Banner uploaded', election });
    } catch (error) { next(error); }
  }
);

export default router;


