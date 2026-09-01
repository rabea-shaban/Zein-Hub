import mongoose, { Document, Schema } from 'mongoose';

export enum ContactMessageStatus {
  NEW = 'new',
  IN_PROGRESS = 'in-progress',
  REPLIED = 'replied',
  ARCHIVED = 'archived',
}

export interface IContactMessage extends Document {
  ticketId: string;
  fullName: string;
  email: string;
  phone: string;
  governorate: string;
  inquiryType: string;
  message: string;
  status: ContactMessageStatus;
  adminNotes?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    governorate: {
      type: String,
      required: true,
      trim: true,
    },
    inquiryType: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ContactMessageStatus),
      default: ContactMessageStatus.NEW,
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ContactMessage = mongoose.model<IContactMessage>(
  'ContactMessage',
  contactMessageSchema
);
