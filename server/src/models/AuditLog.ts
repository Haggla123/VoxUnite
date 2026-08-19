import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'OTP_REQUESTED'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'VOTE_SUBMITTED'
  | 'ELECTION_CREATED'
  | 'ELECTION_UPDATED'
  | 'ELECTION_ACTIVATED'
  | 'ELECTION_CLOSED'
  | 'VOTERS_IMPORTED'
  | 'CANDIDATE_ADDED'
  | 'CANDIDATE_UPDATED'
  | 'RESULTS_MODE_CHANGED';

export interface IAuditLog extends Document {
  action: AuditAction;
  performedBy: string;
  userRole: 'admin' | 'student' | 'system';
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'ADMIN_LOGIN',
        'ADMIN_LOGOUT',
        'OTP_REQUESTED',
        'OTP_VERIFIED',
        'OTP_FAILED',
        'VOTE_SUBMITTED',
        'ELECTION_CREATED',
        'ELECTION_UPDATED',
        'ELECTION_ACTIVATED',
        'ELECTION_CLOSED',
        'VOTERS_IMPORTED',
        'CANDIDATE_ADDED',
        'CANDIDATE_UPDATED',
        'RESULTS_MODE_CHANGED',
      ],
    },
    performedBy: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: ['admin', 'student', 'system'],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ performedBy: 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
