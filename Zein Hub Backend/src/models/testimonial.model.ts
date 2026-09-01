import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  roleTitle: string;
  content: string;
  programId?: Types.ObjectId;
  avatarUrl?: string;
  rating: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, 'Student/Client name is required'],
      trim: true,
    },
    roleTitle: {
      type: String,
      required: [true, 'Role or title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Testimonial content is required'],
      trim: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      default: null,
      index: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
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

export const Testimonial: Model<ITestimonial> = mongoose.model<ITestimonial>(
  'Testimonial',
  testimonialSchema
);
