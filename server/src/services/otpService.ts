import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { OtpSession } from '../models';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const OTP_MAX_RETRIES = parseInt(process.env.OTP_MAX_RETRIES || '3', 10);
const OTP_SALT_ROUNDS = parseInt(process.env.OTP_SALT_ROUNDS || '10', 10);

export const generateOTP = (): string => {
  return randomInt(100000, 1000000).toString();
};

export const createOtpSession = async (
  studentId: string,
  email: string
): Promise<{ otp: string; sessionId: string }> => {
  // Invalidate any existing OTPs for this student
  await OtpSession.updateMany(
    { studentId, email, isUsed: false },
    { isUsed: true }
  );

  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const session = await OtpSession.create({
    studentId,
    email,
    otp: otpHash,
    expiresAt,
    retryCount: 0,
    isVerified: false,
    isUsed: false,
  });

  return { otp, sessionId: session._id.toString() };
};

export const verifyOtp = async (
  studentId: string,
  email: string,
  otp: string
): Promise<{ valid: boolean; message: string }> => {
  const session = await OtpSession.findOne({
    studentId: studentId.toUpperCase(),
    email: email.toLowerCase(),
    isUsed: false,
    isVerified: false,
  }).select('+otp').sort({ createdAt: -1 });

  if (!session) {
    return { valid: false, message: 'No active OTP session found. Please request a new OTP.' };
  }

  if (new Date() > session.expiresAt) {
    await OtpSession.updateOne(
      { _id: session._id, isUsed: false, isVerified: false },
      { $set: { isUsed: true } }
    );
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  const reservedSession = await OtpSession.findOneAndUpdate(
    {
      _id: session._id,
      isUsed: false,
      isVerified: false,
      expiresAt: { $gt: new Date() },
      retryCount: { $lt: OTP_MAX_RETRIES },
    },
    { $inc: { retryCount: 1 } },
    { new: true }
  );

  if (!reservedSession) {
    return { valid: false, message: 'Maximum OTP attempts exceeded. Please request a new OTP.' };
  }

  const otpMatches = await bcrypt.compare(otp, reservedSession.otp);
  if (!otpMatches) {
    if (reservedSession.retryCount >= OTP_MAX_RETRIES) {
      await OtpSession.updateOne(
        { _id: reservedSession._id, isUsed: false, isVerified: false },
        { $set: { isUsed: true } }
      );
      return { valid: false, message: 'Maximum OTP attempts exceeded. Please request a new OTP.' };
    }

    return {
      valid: false,
      message: `Invalid OTP. ${OTP_MAX_RETRIES - reservedSession.retryCount} attempts remaining.`,
    };
  }

  const verifiedSession = await OtpSession.findOneAndUpdate(
    {
      _id: reservedSession._id,
      isUsed: false,
      isVerified: false,
      expiresAt: { $gt: new Date() },
    },
    { $set: { isVerified: true, isUsed: true } },
    { new: true }
  );

  if (!verifiedSession) {
    return { valid: false, message: 'OTP has already been used or expired. Please request a new one.' };
  }

  return { valid: true, message: 'OTP verified successfully' };
};
