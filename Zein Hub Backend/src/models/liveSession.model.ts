import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { LiveSessionProvider, LiveSessionStatus } from '../constants/content.enum.js';

export interface ILiveSession extends Document {
  programId: Types.ObjectId;
  instructorId: Types.ObjectId;
  title: string;
  description?: string;
  provider: LiveSessionProvider;
  meetingUrl: string;
  meetingPassword?: string;
  startTime: Date;
  endTime: Date;
  status: LiveSessionStatus;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const liveSessionSchema = new Schema<ILiveSession>(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program reference is required'],
      index: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      enum: Object.values(LiveSessionProvider),
      default: LiveSessionProvider.GOOGLE_MEET,
    },
    meetingUrl: {
      type: String,
      required: [true, 'Meeting URL is required'],
      trim: true,
    },
    meetingPassword: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: Object.values(LiveSessionStatus),
      default: LiveSessionStatus.SCHEDULED,
      index: true,
    },
    recordingUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const LiveSession: Model<ILiveSession> = mongoose.model<ILiveSession>(
  'LiveSession',
  liveSessionSchema
);
