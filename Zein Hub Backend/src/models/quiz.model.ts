import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IQuiz extends Document {
  programId: Types.ObjectId;
  moduleId?: Types.ObjectId;
  title: string;
  description?: string;
  durationMinutes: number;
  passingScore: number;
  maxAttempts: number;
  availableFrom?: Date;
  availableUntil?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
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
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    passingScore: {
      type: Number,
      default: 70, // percentage or points
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    availableFrom: {
      type: Date,
      default: null,
    },
    availableUntil: {
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

export const Quiz: Model<IQuiz> = mongoose.model<IQuiz>('Quiz', quizSchema);
