import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { SubmissionStatus } from '../constants/content.enum.js';

export interface ISubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  programId: Types.ObjectId;
  fileUrl?: string;
  textContent?: string;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
  gradedBy?: Types.ObjectId;
  gradedAt?: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program reference is required'],
      index: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    textContent: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.SUBMITTED,
      index: true,
    },
    grade: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: null,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 });

export const Submission: Model<ISubmission> = mongoose.model<ISubmission>(
  'Submission',
  submissionSchema
);
