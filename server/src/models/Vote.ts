import mongoose, { Schema, Document } from 'mongoose';

export interface IVoteSelection {
  position: string;
  candidateId: mongoose.Types.ObjectId;
}

export interface IVote extends Document {
  electionId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId;
  voterStudentId: string;
  selections: IVoteSelection[];
  voterFaculty: string;
  voterDepartment: string;
  submittedAt: Date;
  ipAddress: string;
  userAgent: string;
}

const VoteSelectionSchema = new Schema<IVoteSelection>(
  {
    position: { type: String, required: true },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
  },
  { _id: false }
);

const VoteSchema = new Schema<IVote>(
  {
    electionId: {
      type: Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    voterId: {
      type: Schema.Types.ObjectId,
      ref: 'EligibleVoter',
      required: true,
    },
    voterStudentId: {
      type: String,
      required: true,
    },
    selections: {
      type: [VoteSelectionSchema],
      required: true,
      validate: {
        validator: (v: IVoteSelection[]) => v.length > 0,
        message: 'At least one selection is required',
      },
    },
    voterFaculty: {
      type: String,
      required: true,
    },
    voterDepartment: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: false,
  }
);

// Critical: Prevent double voting at database level
VoteSchema.index({ electionId: 1, voterId: 1 }, { unique: true });
VoteSchema.index({ electionId: 1, voterStudentId: 1 }, { unique: true });
VoteSchema.index({ electionId: 1, voterFaculty: 1 });

export default mongoose.model<IVote>('Vote', VoteSchema);
