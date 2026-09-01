import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { QuestionType } from '../constants/content.enum.js';

export interface IQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  quizId: Types.ObjectId;
  type: QuestionType;
  prompt: string;
  options: IQuestionOption[];
  correctAnswers?: string[];
  points: number;
  explanation?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(QuestionType),
      default: QuestionType.MCQ,
      index: true,
    },
    prompt: {
      type: String,
      required: [true, 'Question prompt is required'],
      trim: true,
    },
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    correctAnswers: {
      type: [String],
      default: [],
    },
    points: {
      type: Number,
      default: 1,
    },
    explanation: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ quizId: 1, order: 1 });

export const Question: Model<IQuestion> = mongoose.model<IQuestion>('Question', questionSchema);
