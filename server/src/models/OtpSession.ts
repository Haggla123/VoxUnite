import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpSession extends Document {
  studentId: string;
  email: string;
  otp: string;
  expiresAt: Date;
  retryCount: number;
  isVerified: boolean;
  isUsed: boolean;
  createdAt: Date;
}

const OtpSessionSchema = new Schema<IOtpSession>(
  {
    studentId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire OTP documents
OtpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSessionSchema.index({ studentId: 1, email: 1 });

export default mongoose.model<IOtpSession>('OtpSession', OtpSessionSchema);
