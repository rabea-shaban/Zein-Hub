import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { ProgramStatus } from '../constants/programStatus.enum.js';

export interface ICurriculumWeek {
  weekNumber: number;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  topics: string[];
  topicsEn?: string[];
  practicalProject: string;
  practicalProjectEn?: string;
}

export interface ICapstoneProject {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  deliverable: string;
  deliverableEn?: string;
}

export interface IProgram extends Document {
  titleAr: string;
  titleEn: string;
  slug: string;
  trackId: Types.ObjectId;
  instructorId?: Types.ObjectId;
  descriptionAr: string;
  descriptionEn?: string;
  objectives?: string[];
  targetAudience?: string[];
  targetAudienceEn?: string[];
  learningOutcomes?: string[];
  learningOutcomesEn?: string[];
  curriculum?: ICurriculumWeek[];
  toolsAndGear?: string[];
  toolsAndGearEn?: string[];
  capstoneProject?: ICapstoneProject;
  prerequisites?: string[];
  prerequisitesEn?: string[];
  locationDetails?: string;
  locationDetailsEn?: string;
  status: ProgramStatus;
  isFeatured: boolean;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  durationWeeks: number;
  durationHours?: number;
  totalHours?: number;
  price?: number;
  currency?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curriculumWeekSchema = new Schema(
  {
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    titleEn: { type: String },
    description: { type: String, required: true },
    descriptionEn: { type: String },
    topics: { type: [String], default: [] },
    topicsEn: { type: [String], default: [] },
    practicalProject: { type: String, required: true },
    practicalProjectEn: { type: String },
  },
  { _id: false }
);

const capstoneProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    titleEn: { type: String },
    description: { type: String, required: true },
    descriptionEn: { type: String },
    deliverable: { type: String, required: true },
    deliverableEn: { type: String },
  },
  { _id: false }
);

const programSchema = new Schema<IProgram>(
  {
    titleAr: {
      type: String,
      required: [true, 'Arabic program title is required'],
      trim: true,
    },
    titleEn: {
      type: String,
      required: [true, 'English program title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Program slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    trackId: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
      required: [true, 'Track reference is required'],
      index: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    descriptionAr: {
      type: String,
      required: [true, 'Arabic description is required'],
      trim: true,
    },
    descriptionEn: {
      type: String,
      trim: true,
    },
    objectives: {
      type: [String],
      default: [],
    },
    targetAudience: {
      type: [String],
      default: [],
    },
    targetAudienceEn: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    learningOutcomesEn: {
      type: [String],
      default: [],
    },
    curriculum: {
      type: [curriculumWeekSchema],
      default: [],
    },
    toolsAndGear: {
      type: [String],
      default: [],
    },
    toolsAndGearEn: {
      type: [String],
      default: [],
    },
    capstoneProject: {
      type: capstoneProjectSchema,
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    prerequisitesEn: {
      type: [String],
      default: [],
    },
    locationDetails: {
      type: String,
    },
    locationDetailsEn: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(ProgramStatus),
      default: ProgramStatus.COMING_SOON,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    coverImageUrl: {
      type: String,
      default: null,
    },
    promoVideoUrl: {
      type: String,
      default: null,
    },
    durationWeeks: {
      type: Number,
      default: 4,
    },
    durationHours: {
      type: Number,
      default: 20,
    },
    totalHours: {
      type: Number,
      default: 20,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'EGP',
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

export const Program: Model<IProgram> = mongoose.model<IProgram>('Program', programSchema);
