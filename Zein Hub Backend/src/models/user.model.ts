import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../constants/roles.enum.js';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
      index: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// Async pre-save hook to hash password in Mongoose 8/9
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  // Prevent double-hashing if string is already a valid bcrypt hash
  if (/^\$2[abxy]\$\d+\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
