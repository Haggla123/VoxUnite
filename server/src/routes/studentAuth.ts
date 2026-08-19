import { Router, Request, Response } from 'express';
import { EligibleVoter } from '../models';
import { createOtpSession, verifyOtp } from '../services/otpService';
import { generateStudentToken } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

const router = Router();

// POST /api/auth/request-otp
router.post('/request-otp', async (req: Request, res: Response) => {
  try {
    const { studentId, email } = req.body;

    if (!studentId || !email) {
      res.status(400).json({ message: 'Student ID and email are required' });
      return;
    }

    // Check if student exists in eligible voters database
    const voter = await EligibleVoter.findOne({
      studentId: studentId.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!voter) {
      res.status(404).json({
        message: 'Student not found in the eligible voters database. Please contact your institution.',
      });
      return;
    }

    // Generate and store OTP
    const { otp, sessionId } = await createOtpSession(
      studentId.toUpperCase().trim(),
      email.toLowerCase().trim()
    );

    await createAuditLog(
      'OTP_REQUESTED',
      studentId,
      'student',
      { email, sessionId },
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    // In demo mode, return OTP in response
    // In production, this would send an email
    res.json({
      message: 'OTP sent successfully',
      studentName: voter.fullName,
      // Demo mode: show OTP in response
      demoOtp: otp,
      expiresInMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { studentId, email, otp } = req.body;

    if (!studentId || !email || !otp) {
      res.status(400).json({ message: 'Student ID, email, and OTP are required' });
      return;
    }

    const result = await verifyOtp(
      studentId.toUpperCase().trim(),
      email.toLowerCase().trim(),
      otp
    );

    if (!result.valid) {
      await createAuditLog(
        'OTP_FAILED',
        studentId,
        'student',
        { email, reason: result.message },
        req.ip || '',
        req.headers['user-agent'] || ''
      );

      res.status(400).json({ message: result.message });
      return;
    }

    // Get voter record
    const voter = await EligibleVoter.findOne({
      studentId: studentId.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
    });

    if (!voter) {
      res.status(404).json({ message: 'Voter record not found' });
      return;
    }

    // Generate JWT token for student
    const token = generateStudentToken(voter);

    await createAuditLog(
      'OTP_VERIFIED',
      studentId,
      'student',
      { email },
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    res.json({
      message: 'Authentication successful',
      token,
      student: {
        id: voter._id,
        studentId: voter.studentId,
        fullName: voter.fullName,
        email: voter.email,
        faculty: voter.faculty,
        department: voter.department,
        hasVoted: voter.hasVoted,
        votedElectionIds: voter.votedElectionIds,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
