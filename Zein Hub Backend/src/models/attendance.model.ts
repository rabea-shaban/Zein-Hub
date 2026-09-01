import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { AttendanceStatus } from '../constants/content.enum.js';

export interface IAttendance extends Document {
  liveSessionId: Types.ObjectId;
  studentId: Types.ObjectId;
  programId: Types.ObjectId;
  status: AttendanceStatus;
  isPresent: boolean;
  attendanceMinutes?: number;
  joinedAt?: Date;
  leftAt?: Date;
  notes?: string;
  markedBy?: Types.ObjectId;
  markedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    liveSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'LiveSession',
      required: [true, 'Live session reference is required'],
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
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
      index: true,
    },
    isPresent: {
      type: Boolean,
      default: true,
    },
    attendanceMinutes: {
      type: Number,
      default: null,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound Unique Index to prevent duplicate attendance record per student per live session
attendanceSchema.index({ liveSessionId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1, programId: 1 });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>('Attendance', attendanceSchema);
