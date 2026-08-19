import { Router, Request, Response } from 'express';
import { Election, Candidate, Vote, EligibleVoter } from '../models';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// GET /api/results/:electionId
router.get('/:electionId', async (req: Request, res: Response) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) { res.status(404).json({ message: 'Election not found' }); return; }

    // Basic turnout data (always available)
    const turnout = {
      totalEligible: election.totalEligibleVoters,
      totalVotes: election.totalVotesCast,
      participationRate: election.totalEligibleVoters > 0 ? ((election.totalVotesCast / election.totalEligibleVoters) * 100).toFixed(1) : 0,
    };

    // Faculty turnout
    const facultyTurnout = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $group: { _id: '$voterFaculty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // If election is closed OR live results mode, show candidate results
    if (election.status === 'closed' || election.resultsVisibility === 'live') {
      const candidates = await Candidate.find({ electionId: election._id }).sort({ position: 1, voteCount: -1 });
      const positions: any = {};
      candidates.forEach((c) => {
        if (!positions[c.position]) positions[c.position] = [];
        positions[c.position].push({ id: c._id, fullName: c.fullName, photo: c.photo, slogan: c.slogan, voteCount: c.voteCount, percentage: election.totalVotesCast > 0 ? ((c.voteCount / election.totalVotesCast) * 100).toFixed(1) : 0 });
      });
      res.json({ election: { id: election._id, title: election.title, status: election.status, resultsVisibility: election.resultsVisibility }, turnout, facultyTurnout, positions, showResults: true });
    } else {
      res.json({ election: { id: election._id, title: election.title, status: election.status, resultsVisibility: election.resultsVisibility }, turnout, facultyTurnout, showResults: false });
    }
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
