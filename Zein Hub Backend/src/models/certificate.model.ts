import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ICertificate extends Document {
  certificateNumber: string;
  studentId: Types.ObjectId;
  programId: Types.ObjectId;
  enrollmentId?: Types.ObjectId;
  finalGrade: number;
  issuedAt: Date;
  certificateUrl: string;
  verificationUrl: string;
  isRevoked: boolean;
  revokedReason?: string;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    certificateNumber: {
      type: String,
      required: [true, 'Certificate number is required'],
      unique: true,
      trim: true,
      index: true,
    },
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
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      index: true,
    },
    finalGrade: {
      type: Number,
      required: [true, 'Final grade is required'],
      min: 0,
      max: 100,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    certificateUrl: {
      type: String,
      required: true,
    },
    verificationUrl: {
      type: String,
      default: '',
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedReason: {
      type: String,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', certificateSchema);
