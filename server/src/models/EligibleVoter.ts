import mongoose, { Schema, Document } from 'mongoose';

export interface IEligibleVoter extends Document {
  studentId: string;
  fullName: string;
  email: string;
  faculty: string;
  department: string;
  hasVoted: boolean;
  votedElectionIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  importBatchId: string;
  createdAt: Date;
  updatedAt: Date;
}

const EligibleVoterSchema = new Schema<IEligibleVoter>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      uppercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    faculty: {
      type: String,
      required: [true, 'Faculty is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    hasVoted: {
      type: Boolean,
      default: false,
    },
    votedElectionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Election',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    importBatchId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

EligibleVoterSchema.index({ studentId: 1, email: 1 }, { unique: true });
EligibleVoterSchema.index({ faculty: 1 });
EligibleVoterSchema.index({ department: 1 });
EligibleVoterSchema.index({ importBatchId: 1 });

export default mongoose.model<IEligibleVoter>('EligibleVoter', EligibleVoterSchema);
