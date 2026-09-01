import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { EnrollmentStatus } from '../constants/enrollmentStatus.enum.js';

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  programId: Types.ObjectId;
  applicationId?: Types.ObjectId;
  status: EnrollmentStatus;
  enrolledAt: Date;
  finalGrade?: number;
  certificateUrl?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
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
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    finalGrade: {
      type: Number,
      default: null,
    },
    certificateUrl: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index to prevent duplicate enrollment for the same course by the same student
enrollmentSchema.index({ studentId: 1, programId: 1 }, { unique: true });

export const Enrollment: Model<IEnrollment> = mongoose.model<IEnrollment>(
  'Enrollment',
  enrollmentSchema
);
