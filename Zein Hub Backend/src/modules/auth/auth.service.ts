import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.config.js';
import { User, IUser } from '../../models/user.model.js';
import { InstructorProfile } from '../../models/instructorProfile.model.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  IRegisterStudentDTO,
  ILoginDTO,
  IAuthTokens,
  ITokenPayload,
  IAuthResponseData,
  IAuthResponseUser,
} from './auth.types.js';

export class AuthService {
  /**
   * Helper to format User model to clean Auth Response User
   */
  private static formatUser(user: IUser): IAuthResponseUser {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl || null,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  /**
   * Generate Access & Refresh JWT Tokens
   */
  public static generateTokens(user: IUser): IAuthTokens {
    const payload: ITokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a new student account (forces role to student)
   */
  public static async registerStudent(dto: IRegisterStudentDTO): Promise<IAuthResponseData> {
    const email = dto.email.toLowerCase().trim();

    // Check email uniqueness
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email address is already registered');
    }

    // Force role to STUDENT strictly regardless of input payload
    const newUser = new User({
      fullName: dto.fullName.trim(),
      email,
      password: dto.password,
      phone: dto.phone?.trim() || undefined,
      role: UserRole.STUDENT,
      isActive: true,
    });

    await newUser.save();

    const tokens = this.generateTokens(newUser);

    return {
      user: this.formatUser(newUser),
      tokens,
    };
  }

  /**
   * Login user with email & password
   */
  public static async loginUser(dto: ILoginDTO): Promise<IAuthResponseData> {
    const email = dto.email.toLowerCase().trim();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account is deactivated. Please contact platform administrator.');
    }

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const tokens = this.generateTokens(user);

    return {
      user: this.formatUser(user),
      tokens,
    };
  }

  /**
   * Issue a new Access Token using a valid Refresh Token
   */
  public static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }

    let decoded: ITokenPayload;
    try {
      decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as ITokenPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Refresh token expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid refresh token signature');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found: Account may have been removed');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated. Please contact administrator.');
    }

    const payload: ITokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const newAccessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any,
    });

    return { accessToken: newAccessToken };
  }

  /**
   * Retrieve authenticated user profile with related role metadata
   */
  public static async getProfile(userId: string): Promise<Record<string, any>> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }

    const profileData: Record<string, any> = {
      user: this.formatUser(user),
    };

    // If Instructor, attach profile details
    if (user.role === UserRole.INSTRUCTOR) {
      const instructorProfile = await InstructorProfile.findOne({
        userId: user._id,
      }).populate('assignedPrograms', 'titleAr titleEn slug status coverImageUrl');

      profileData.instructorProfile = instructorProfile;
    }

    return profileData;
  }
}
