import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITrack extends Document {
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  iconUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const trackSchema = new Schema<ITrack>(
  {
    nameAr: {
      type: String,
      required: [true, 'Arabic track name is required'],
      trim: true,
    },
    nameEn: {
      type: String,
      required: [true, 'English track name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Track slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    descriptionAr: {
      type: String,
      trim: true,
    },
    descriptionEn: {
      type: String,
      trim: true,
    },
    iconUrl: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Track: Model<ITrack> = mongoose.model<ITrack>('Track', trackSchema);
