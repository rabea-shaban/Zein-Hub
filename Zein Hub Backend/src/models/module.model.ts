import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IModule extends Document {
  programId: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Module title is required'],
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

// Compound index for ordering modules within a program
moduleSchema.index({ programId: 1, order: 1 });

export const Module: Model<IModule> = mongoose.model<IModule>('Module', moduleSchema);
