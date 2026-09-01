import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { LessonContentType } from '../constants/content.enum.js';

export interface ILessonResource {
  title: string;
  fileUrl: string;
  type?: string;
}

export interface ILesson extends Document {
  moduleId: Types.ObjectId;
  programId: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  contentType: LessonContentType;
  contentUrl?: string;
  textBody?: string;
  resources: ILessonResource[];
  durationMinutes?: number;
  isFreePreview: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module reference is required'],
      index: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    contentType: {
      type: String,
      enum: Object.values(LessonContentType),
      default: LessonContentType.VIDEO,
      index: true,
    },
    contentUrl: {
      type: String,
      default: null,
    },
    textBody: {
      type: String,
      default: null,
    },
    resources: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        type: { type: String, default: 'pdf' },
      },
    ],
    durationMinutes: {
      type: Number,
      default: 10,
    },
    isFreePreview: {
      type: Boolean,
      default: false,
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

// Compound index for module lessons order
lessonSchema.index({ moduleId: 1, order: 1 });

export const Lesson: Model<ILesson> = mongoose.model<ILesson>('Lesson', lessonSchema);
