import mongoose, { Schema, Document } from 'mongoose';

export type ElectionStatus = 'draft' | 'scheduled' | 'active' | 'closed';

export interface IPosition {
  title: string;
  maxVotes: number;
  order: number;
}

export interface IElection extends Document {
  title: string;
  description: string;
  facultyScope: string[];
  startDate: Date;
  endDate: Date;
  status: ElectionStatus;
  banner: string;
  rules: string[];
  positions: IPosition[];
  resultsVisibility: 'safe' | 'live';
  totalEligibleVoters: number;
  totalVotesCast: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PositionSchema = new Schema<IPosition>(
  {
    title: { type: String, required: true, trim: true },
    maxVotes: { type: Number, default: 1, min: 1 },
    order: { type: Number, required: true },
  },
  { _id: true }
);

const ElectionSchema = new Schema<IElection>(
  {
    title: {
      type: String,
      required: [true, 'Election title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Election description is required'],
      trim: true,
    },
    facultyScope: [
      {
        type: String,
        trim: true,
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'closed'],
      default: 'draft',
    },
    banner: {
      type: String,
      default: '',
    },
    rules: [
      {
        type: String,
        trim: true,
      },
    ],
    positions: [PositionSchema],
    resultsVisibility: {
      type: String,
      enum: ['safe', 'live'],
      default: 'safe',
    },
    totalEligibleVoters: {
      type: Number,
      default: 0,
    },
    totalVotesCast: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ElectionSchema.index({ status: 1 });
ElectionSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<IElection>('Election', ElectionSchema);
