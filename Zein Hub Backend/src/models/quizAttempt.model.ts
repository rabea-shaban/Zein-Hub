import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IQuizAttemptAnswer {
  questionId: Types.ObjectId;
  selectedOptionIds: string[];
  isCorrect: boolean;
  pointsEarned: number;
}

export interface IQuizAttempt extends Document {
  studentId: Types.ObjectId;
  quizId: Types.ObjectId;
  programId: Types.ObjectId;
  answers: IQuizAttemptAnswer[];
  score: number;
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  attemptNumber: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
      index: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program reference is required'],
      index: true,
    },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedOptionIds: [{ type: String, required: true }],
        isCorrect: { type: Boolean, required: true },
        pointsEarned: { type: Number, required: true, default: 0 },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    pointsEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

quizAttemptSchema.index({ studentId: 1, quizId: 1 });

export const QuizAttempt: Model<IQuizAttempt> =
  mongoose.models.QuizAttempt ||
  mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
