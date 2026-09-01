import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IInstructorProfile extends Document {
  userId: Types.ObjectId;
  specializationTrackId?: Types.ObjectId;
  specializations: string[];
  bio: string;
  experienceYears?: number;
  assignedPrograms: Types.ObjectId[];
  photoUrl?: string;
  reelUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    portfolio?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const instructorProfileSchema = new Schema<IInstructorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    specializationTrackId: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
      default: null,
    },
    specializations: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      required: [true, 'Instructor bio is required'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    assignedPrograms: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Program',
      },
    ],
    photoUrl: {
      type: String,
      default: null,
    },
    reelUrl: {
      type: String,
      default: null,
    },
    socialLinks: {
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      youtube: { type: String, default: null },
      portfolio: { type: String, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const InstructorProfile: Model<IInstructorProfile> = mongoose.model<IInstructorProfile>(
  'InstructorProfile',
  instructorProfileSchema
);
