import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { ApplicationStatus } from '../constants/applicationStatus.enum.js';

export interface IApplication extends Document {
  studentId: Types.ObjectId;
  programId: Types.ObjectId;
  status: ApplicationStatus;
  motivation?: string;
  portfolioUrl?: string;
  audioSampleUrl?: string;
  governorate?: string;
  reviewedBy?: Types.ObjectId;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
      index: true,
    },
    motivation: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      default: null,
    },
    audioSampleUrl: {
      type: String,
      default: null,
    },
    governorate: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index to prevent multiple applications for the same program by the same student
applicationSchema.index({ studentId: 1, programId: 1 }, { unique: true });

export const Application: Model<IApplication> = mongoose.model<IApplication>(
  'Application',
  applicationSchema
);
