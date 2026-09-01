import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IReview extends Document {
  studentId: Types.ObjectId;
  programId: Types.ObjectId;
  rating: number;
  comment: string;
  status: ReviewStatus;
  isFeatured: boolean;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required (1 - 5 stars)'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review feedback comment is required'],
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.PENDING,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    moderationNotes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound Unique Index to prevent a student from submitting multiple reviews for the same program
reviewSchema.index({ studentId: 1, programId: 1 }, { unique: true });
reviewSchema.index({ status: 1, isFeatured: 1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
