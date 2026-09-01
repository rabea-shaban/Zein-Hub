import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { AssignmentSubmissionType } from '../constants/content.enum.js';

export interface IAssignment extends Document {
  programId: Types.ObjectId;
  moduleId?: Types.ObjectId;
  title: string;
  description: string;
  instructions?: string;
  submissionType: AssignmentSubmissionType;
  maxScore: number;
  deadline?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program reference is required'],
      index: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
      trim: true,
    },
    instructions: {
      type: String,
      default: null,
    },
    submissionType: {
      type: String,
      enum: Object.values(AssignmentSubmissionType),
      default: AssignmentSubmissionType.AUDIO,
      index: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    deadline: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment: Model<IAssignment> = mongoose.model<IAssignment>(
  'Assignment',
  assignmentSchema
);
