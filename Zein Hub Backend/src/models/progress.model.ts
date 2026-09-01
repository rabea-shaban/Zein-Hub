import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IQuizProgress {
  quizId: Types.ObjectId;
  highestScore: number;
  passed: boolean;
  attemptsCount: number;
  lastAttemptAt: Date;
}

export interface IProgress extends Document {
  studentId: Types.ObjectId;
  programId: Types.ObjectId;
  completedLessons: Types.ObjectId[];
  quizProgress: IQuizProgress[];
  completionPercentage: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
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
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    quizProgress: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
        highestScore: { type: Number, default: 0 },
        passed: { type: Boolean, default: false },
        attemptsCount: { type: Number, default: 0 },
        lastAttemptAt: { type: Date, default: Date.now },
      },
    ],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index to track student progress per course
progressSchema.index({ studentId: 1, programId: 1 }, { unique: true });

export const Progress: Model<IProgress> = mongoose.model<IProgress>('Progress', progressSchema);
