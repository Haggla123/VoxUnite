import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  fullName: string;
  photo: string;
  manifesto: string;
  slogan: string;
  faculty: string;
  department: string;
  position: string;
  electionId: mongoose.Types.ObjectId;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    fullName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    manifesto: {
      type: String,
      default: '',
      trim: true,
    },
    slogan: {
      type: String,
      default: '',
      trim: true,
    },
    faculty: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    electionId: {
      type: Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CandidateSchema.index({ electionId: 1, position: 1 });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
