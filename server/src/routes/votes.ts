import { Router, Request, Response } from 'express';
import { Vote, Election, Candidate, EligibleVoter } from '../models';
import { authenticateStudent } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

const router = Router();

// POST /api/votes - Cast a vote
router.post('/', authenticateStudent, async (req: Request, res: Response) => {
  try {
    const { electionId, selections } = req.body;
    const voter = req.studentVoter;

    // 1. Verify election is active
    const election = await Election.findById(electionId);
    if (!election) { res.status(404).json({ message: 'Election not found' }); return; }
    if (election.status !== 'active') { res.status(400).json({ message: 'This election is not currently active' }); return; }

    // 2. Check voter eligibility
    const eligibleVoter = await EligibleVoter.findOne({ studentId: voter.studentId, email: voter.email, isActive: true });
    if (!eligibleVoter) { res.status(403).json({ message: 'You are not eligible to vote' }); return; }

    // 3. Check if already voted (triple check)
    if (eligibleVoter.votedElectionIds.some((id) => id.toString() === electionId)) {
      res.status(409).json({ message: 'You have already voted in this election' }); return;
    }
    const existingVote = await Vote.findOne({ electionId, voterId: eligibleVoter._id });
    if (existingVote) { res.status(409).json({ message: 'Duplicate vote detected' }); return; }

    // 4. Validate selections
    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      res.status(400).json({ message: 'At least one selection is required' }); return;
    }

    // Verify all candidates exist and belong to this election
    for (const sel of selections) {
      const candidate = await Candidate.findOne({ _id: sel.candidateId, electionId, position: sel.position });
      if (!candidate) { res.status(400).json({ message: `Invalid candidate for position: ${sel.position}` }); return; }
    }

    // 5. Create the vote
    const vote = await Vote.create({
      electionId,
      voterId: eligibleVoter._id,
      voterStudentId: voter.studentId,
      selections,
      voterFaculty: voter.faculty,
      voterDepartment: voter.department,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    // 6. Update candidate vote counts
    for (const sel of selections) {
      await Candidate.findByIdAndUpdate(sel.candidateId, { $inc: { voteCount: 1 } });
    }

    // 7. Update voter record
    eligibleVoter.hasVoted = true;
    eligibleVoter.votedElectionIds.push(election._id);
    await eligibleVoter.save();

    // 8. Update election vote count
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotesCast: 1 } });

    // 9. Audit log
    await createAuditLog('VOTE_SUBMITTED', voter.studentId, 'student', { electionId, faculty: voter.faculty, department: voter.department }, req.ip || '', req.headers['user-agent'] || '');

    // 10. Emit socket event (anonymized)
    const io = req.app.get('io');
    if (io) {
      const updatedElection = await Election.findById(electionId);
      io.to(`election:${electionId}`).emit('vote:cast', {
        electionId,
        totalVotesCast: updatedElection?.totalVotesCast || 0,
        faculty: voter.faculty,
        department: voter.department,
        timestamp: new Date(),
      });
    }

    res.status(201).json({ message: 'Vote recorded successfully', voteId: vote._id });
  } catch (error: any) {
    if (error.code === 11000) { res.status(409).json({ message: 'Duplicate vote prevented' }); return; }
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/votes/check/:electionId
router.get('/check/:electionId', authenticateStudent, async (req: Request, res: Response) => {
  try {
    const voter = req.studentVoter;
    const eligibleVoter = await EligibleVoter.findOne({ studentId: voter.studentId });
    const hasVoted = eligibleVoter?.votedElectionIds.some((id) => id.toString() === req.params.electionId) || false;
    res.json({ hasVoted });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
