import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../../models/user.model.js';
import { InstructorProfile, IInstructorProfile } from '../../models/instructorProfile.model.js';
import { Program } from '../../models/program.model.js';
import { Track } from '../../models/track.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { Submission } from '../../models/submission.model.js';
import { LiveSession } from '../../models/liveSession.model.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  ICreateInstructorDTO,
  IUpdateInstructorAdminDTO,
  IUpdateInstructorSelfDTO,
  IInstructorFilterQuery,
} from './instructors.types.js';

export class InstructorsService {
  /**
   * Get all active instructors for public catalog
   */
  public static async getAllPublicInstructors(): Promise<any[]> {
    const profiles = await InstructorProfile.find({ isActive: true })
      .populate('userId', 'fullName avatarUrl phone email isActive')
      .populate('specializationTrackId', 'nameAr nameEn slug')
      .populate('assignedPrograms', 'titleAr titleEn slug coverImageUrl status isFeatured')
      .sort({ createdAt: -1 });

    return profiles
      .filter((prof) => prof.userId && (prof.userId as any).isActive)
      .map((prof) => ({
        id: prof._id,
        user: prof.userId,
        specializationTrack: prof.specializationTrackId,
        specializations: prof.specializations,
        bio: prof.bio,
        experienceYears: prof.experienceYears,
        photoUrl: prof.photoUrl,
        reelUrl: prof.reelUrl,
        socialLinks: prof.socialLinks,
        assignedPrograms: prof.assignedPrograms,
      }));
  }

  /**
   * Get single instructor public profile by Profile ID or User ID
   */
  public static async getPublicInstructorById(idOrUserId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(idOrUserId)) {
      throw ApiError.badRequest('Invalid instructor identifier format');
    }

    const profile = await InstructorProfile.findOne({
      $or: [{ _id: idOrUserId }, { userId: idOrUserId }],
      isActive: true,
    })
      .populate('userId', 'fullName avatarUrl phone email isActive')
      .populate('specializationTrackId', 'nameAr nameEn slug descriptionAr descriptionEn')
      .populate('assignedPrograms', 'titleAr titleEn slug coverImageUrl status durationWeeks totalHours isFeatured');

    if (!profile || !profile.userId || !(profile.userId as any).isActive) {
      throw ApiError.notFound('Instructor profile not found or inactive');
    }

    return {
      id: profile._id,
      user: profile.userId,
      specializationTrack: profile.specializationTrackId,
      specializations: profile.specializations,
      bio: profile.bio,
      experienceYears: profile.experienceYears,
      photoUrl: profile.photoUrl,
      reelUrl: profile.reelUrl,
      socialLinks: profile.socialLinks,
      assignedPrograms: profile.assignedPrograms,
    };
  }

  /**
   * Super Admin: List all instructors with pagination, search, and track filter
   */
  public static async getAllInstructorsAdmin(query: IInstructorFilterQuery = {}): Promise<{
    instructors: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const filter: Record<string, any> = {};

    if (typeof query.isActive === 'boolean') {
      filter.isActive = query.isActive;
    }

    if (query.trackId && mongoose.Types.ObjectId.isValid(query.trackId)) {
      filter.specializationTrackId = query.trackId;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    let userFilter: Record<string, any> = { role: UserRole.INSTRUCTOR };
    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      userFilter.$or = [{ fullName: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
      const matchingUsers = await User.find(userFilter).select('_id');
      const userIds = matchingUsers.map((u) => u._id);
      filter.userId = { $in: userIds };
    }

    const [profiles, total] = await Promise.all([
      InstructorProfile.find(filter)
        .populate('userId', 'fullName email phone avatarUrl isActive lastLogin createdAt')
        .populate('specializationTrackId', 'nameAr nameEn slug')
        .populate('assignedPrograms', 'titleAr titleEn slug status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InstructorProfile.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      instructors: profiles,
      meta: { total, page, limit, totalPages },
    };
  }

  /**
   * Super Admin: Create a new Instructor account and linked profile
   */
  public static async createInstructor(dto: ICreateInstructorDTO): Promise<any> {
    const email = dto.email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    // Validate track reference if provided
    if (dto.specializationTrackId) {
      const track = await Track.findById(dto.specializationTrackId);
      if (!track) {
        throw ApiError.notFound('Specialization Track not found');
      }
    }

    // Validate assigned programs if provided
    if (dto.assignedPrograms && dto.assignedPrograms.length > 0) {
      const programsCount = await Program.countDocuments({
        _id: { $in: dto.assignedPrograms },
      } as any);
      if (programsCount !== dto.assignedPrograms.length) {
        throw ApiError.badRequest('One or more assigned program IDs are invalid');
      }
    }

    // 1. Create User with role INSTRUCTOR
    const user = new User({
      fullName: dto.fullName.trim(),
      email,
      password: dto.password,
      phone: dto.phone?.trim() || undefined,
      role: UserRole.INSTRUCTOR,
      avatarUrl: dto.photoUrl?.trim() || null,
      isActive: true,
    });
    await user.save();

    // 2. Create InstructorProfile linked to user._id
    const instructorProfile = new InstructorProfile({
      userId: user._id,
      specializationTrackId: dto.specializationTrackId || null,
      specializations: dto.specializations || [],
      bio: dto.bio.trim(),
      experienceYears: dto.experienceYears ?? 0,
      assignedPrograms: dto.assignedPrograms || [],
      photoUrl: dto.photoUrl?.trim() || null,
      reelUrl: dto.reelUrl?.trim() || null,
      socialLinks: dto.socialLinks || {},
      isActive: true,
    });
    await instructorProfile.save();

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
      },
      instructorProfile,
    };
  }

  /**
   * Super Admin: Update instructor user and profile details
   */
  public static async updateInstructorByAdmin(
    idOrUserId: string,
    dto: IUpdateInstructorAdminDTO
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(idOrUserId)) {
      throw ApiError.badRequest('Invalid instructor identifier format');
    }

    const profile = await InstructorProfile.findOne({
      $or: [{ _id: idOrUserId }, { userId: idOrUserId }],
    });

    if (!profile) {
      throw ApiError.notFound('Instructor profile not found');
    }

    const user = await User.findById(profile.userId);
    if (!user) {
      throw ApiError.notFound('User account linked to instructor profile not found');
    }

    // Update User fields
    if (dto.fullName) user.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone?.trim() || undefined;
    if (dto.password) {
      user.password = dto.password;
    }
    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
      profile.isActive = dto.isActive;
    }
    if (dto.photoUrl) user.avatarUrl = dto.photoUrl.trim();

    await user.save();

    // Update Profile fields
    if (dto.specializationTrackId !== undefined) {
      if (dto.specializationTrackId) {
        const track = await Track.findById(dto.specializationTrackId);
        if (!track) throw ApiError.notFound('Specialization Track not found');
        profile.specializationTrackId = new mongoose.Types.ObjectId(dto.specializationTrackId);
      } else {
        profile.specializationTrackId = undefined as any;
      }
    }

    if (dto.specializations !== undefined) profile.specializations = dto.specializations;
    if (dto.bio) profile.bio = dto.bio.trim();
    if (dto.experienceYears !== undefined) profile.experienceYears = dto.experienceYears;
    if (dto.assignedPrograms !== undefined) {
      profile.assignedPrograms = dto.assignedPrograms.map(
        (pid) => new mongoose.Types.ObjectId(pid)
      );
    }
    if (dto.photoUrl !== undefined) profile.photoUrl = dto.photoUrl?.trim() || undefined;
    if (dto.reelUrl !== undefined) profile.reelUrl = dto.reelUrl?.trim() || undefined;
    if (dto.socialLinks !== undefined) profile.socialLinks = dto.socialLinks;

    await profile.save();

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
      },
      instructorProfile: profile,
    };
  }

  /**
   * Super Admin: Change Instructor account activation status
   */
  public static async changeStatus(idOrUserId: string, isActive: boolean): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(idOrUserId)) {
      throw ApiError.badRequest('Invalid identifier format');
    }

    const profile = await InstructorProfile.findOne({
      $or: [{ _id: idOrUserId }, { userId: idOrUserId }],
    });

    if (!profile) {
      throw ApiError.notFound('Instructor profile not found');
    }

    const user = await User.findById(profile.userId);
    if (user) {
      user.isActive = isActive;
      await user.save();
    }

    profile.isActive = isActive;
    await profile.save();

    return {
      id: profile._id,
      userId: profile.userId,
      isActive,
      message: `Instructor account has been ${isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  /**
   * Super Admin: Update assigned programs for instructor directly
   */
  public static async updateAssignedPrograms(idOrUserId: string, programIds: string[]): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(idOrUserId)) {
      throw ApiError.badRequest('Invalid identifier format');
    }

    const profile = await InstructorProfile.findOne({
      $or: [{ _id: idOrUserId }, { userId: idOrUserId }],
    });

    if (!profile) {
      throw ApiError.notFound('Instructor profile not found');
    }

    // Verify all programs exist
    const count = await Program.countDocuments({ _id: { $in: programIds } } as any);
    if (count !== programIds.length) {
      throw ApiError.badRequest('One or more program IDs do not exist');
    }

    profile.assignedPrograms = programIds.map((pid) => new mongoose.Types.ObjectId(pid));
    await profile.save();

    return {
      id: profile._id,
      assignedPrograms: profile.assignedPrograms,
      totalPrograms: profile.assignedPrograms.length,
    };
  }

  /**
   * Instructor: Update own profile details (restricted: no role/email/assignedPrograms alteration)
   */
  public static async updateSelfProfile(
    userId: string,
    dto: IUpdateInstructorSelfDTO
  ): Promise<any> {
    const user = await User.findById(userId).select('+password');
    if (!user || user.role !== UserRole.INSTRUCTOR) {
      throw ApiError.forbidden('Forbidden: Only instructors can update instructor profile');
    }

    if (dto.fullName) user.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone?.trim() || undefined;

    // Handle photo / avatar update
    const photo = dto.avatarUrl !== undefined ? dto.avatarUrl : dto.photoUrl;
    if (photo !== undefined) {
      user.avatarUrl = photo?.trim() || undefined;
    }

    // Handle password change
    const newPass = dto.newPassword || dto.password;
    if (newPass) {
      if (dto.currentPassword) {
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password || '');
        if (!isMatch) {
          throw ApiError.badRequest('Current password provided is incorrect');
        }
      }
      user.password = newPass;
    }

    await user.save();

    let profile = await InstructorProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new InstructorProfile({
        userId: user._id,
        bio: dto.bio || 'Instructor biography',
        specializations: dto.specializations || [],
        experienceYears: dto.experienceYears ?? 0,
        photoUrl: photo?.trim() || undefined,
        reelUrl: dto.reelUrl?.trim() || undefined,
        socialLinks: dto.socialLinks || {},
        isActive: true,
      });
    } else {
      if (dto.bio !== undefined) profile.bio = dto.bio ? dto.bio.trim() : profile.bio;
      if (dto.specializations !== undefined) profile.specializations = dto.specializations;
      if (dto.experienceYears !== undefined) profile.experienceYears = dto.experienceYears;
      if (photo !== undefined) profile.photoUrl = photo?.trim() || undefined;
      if (dto.reelUrl !== undefined) profile.reelUrl = dto.reelUrl?.trim() || undefined;
      if (dto.socialLinks !== undefined) {
        profile.socialLinks = { ...profile.socialLinks, ...dto.socialLinks };
      }
    }

    await profile.save();

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      instructorProfile: profile,
    };
  }

  /**
   * Instructor: Dashboard metrics and performance overview
   */
  public static async getInstructorDashboard(userId: string): Promise<any> {
    const profile = await InstructorProfile.findOne({ userId, isActive: true }).populate(
      'assignedPrograms',
      'titleAr titleEn slug coverImageUrl status durationWeeks'
    );

    if (!profile) {
      throw ApiError.notFound('Active instructor profile not found');
    }

    const assignedProgramIds = profile.assignedPrograms.map((p: any) => p._id);

    // Run parallel counts for dashboard
    const [
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      pendingSubmissions,
      upcomingLiveSessions,
    ] = await Promise.all([
      Enrollment.countDocuments({ programId: { $in: assignedProgramIds } } as any),
      Enrollment.countDocuments({ programId: { $in: assignedProgramIds }, status: 'active' } as any),
      Enrollment.countDocuments({ programId: { $in: assignedProgramIds }, status: 'completed' } as any),
      Submission.countDocuments({ programId: { $in: assignedProgramIds }, status: 'submitted' } as any),
      LiveSession.countDocuments({
        instructorId: userId,
        status: 'scheduled',
        startTime: { $gte: new Date() },
      } as any),
    ]);

    return {
      instructor: {
        id: profile._id,
        userId: profile.userId,
        specializations: profile.specializations,
        experienceYears: profile.experienceYears,
      },
      metrics: {
        totalAssignedPrograms: assignedProgramIds.length,
        totalStudentsEnrolled: totalEnrollments,
        activeStudents: activeEnrollments,
        completedStudents: completedEnrollments,
        pendingSubmissionsToGrade: pendingSubmissions,
        upcomingLiveSessionsCount: upcomingLiveSessions,
      },
      assignedPrograms: profile.assignedPrograms,
    };
  }

  /**
   * Instructor: List assigned programs with individual student statistics
   */
  public static async getMyAssignedPrograms(userId: string): Promise<any[]> {
    const profile = await InstructorProfile.findOne({ userId });

    const assignedFromProfile = (profile?.assignedPrograms || []).map((p: any) => p.toString());
    const directAssigned = await Program.find({ instructorId: userId }).select('_id');
    const directIds = directAssigned.map((p) => p._id.toString());

    const allProgramIds = Array.from(new Set([...assignedFromProfile, ...directIds]));

    const filter = allProgramIds.length > 0 ? { _id: { $in: allProgramIds }, isActive: true } : { isActive: true };

    const programs = await Program.find(filter).populate('trackId', 'nameAr nameEn slug');

    const programsWithStats = await Promise.all(
      programs.map(async (prog) => {
        const [totalStudents, activeStudents, pendingSubmissions] = await Promise.all([
          Enrollment.countDocuments({ programId: prog._id } as any),
          Enrollment.countDocuments({ programId: prog._id, status: 'active' } as any),
          Submission.countDocuments({ programId: prog._id, status: 'submitted' } as any),
        ]);

        return {
          ...prog.toObject(),
          studentsCount: totalStudents,
          instructorStats: {
            totalStudents,
            activeStudents,
            pendingSubmissions,
          },
        };
      })
    );

    return programsWithStats;
  }

  /**
   * Instructor: List enrolled students in instructor's assigned programs with course details
   */
  public static async getMyEnrolledStudents(
    userId: string,
    query: { programId?: string; status?: string; search?: string } = {}
  ): Promise<any> {
    const profile = await InstructorProfile.findOne({ userId, isActive: true });

    // Also find programs where instructorId is directly assigned to this userId
    const directPrograms = await Program.find({ instructorId: userId, isActive: true }).select('_id');
    const directProgramIds = directPrograms.map((p) => p._id);

    const assignedProgramIds = profile
      ? Array.from(
          new Set([
            ...profile.assignedPrograms.map((p: any) => p.toString()),
            ...directProgramIds.map((p) => p.toString()),
          ])
        ).map((id) => new mongoose.Types.ObjectId(id))
      : directProgramIds;

    const filter: Record<string, any> = {
      programId: { $in: assignedProgramIds },
    };

    if (query.programId && mongoose.Types.ObjectId.isValid(query.programId)) {
      filter.programId = new mongoose.Types.ObjectId(query.programId);
    }

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'fullName email phone avatarUrl isActive createdAt')
      .populate('programId', 'titleAr titleEn slug coverImageUrl price durationWeeks trackId')
      .sort({ enrolledAt: -1 });

    // Filter by student search query if provided
    let results = enrollments;
    if (query.search && query.search.trim() !== '') {
      const s = query.search.toLowerCase().trim();
      results = enrollments.filter((enr: any) => {
        const student = enr.studentId;
        const prog = enr.programId;
        const name = (student?.fullName || '').toLowerCase();
        const email = (student?.email || '').toLowerCase();
        const pTitleAr = (prog?.titleAr || '').toLowerCase();
        const pTitleEn = (prog?.titleEn || '').toLowerCase();
        return name.includes(s) || email.includes(s) || pTitleAr.includes(s) || pTitleEn.includes(s);
      });
    }

    return results;
  }

  /**
   * Super Admin: Delete instructor profile and user account
   */
  public static async deleteInstructor(idOrUserId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(idOrUserId)) {
      throw ApiError.badRequest('Invalid instructor identifier format');
    }

    const profile = await InstructorProfile.findOne({
      $or: [{ _id: idOrUserId }, { userId: idOrUserId }],
    });

    if (profile) {
      await User.findByIdAndDelete(profile.userId);
      await InstructorProfile.findByIdAndDelete(profile._id);
    } else {
      await User.findByIdAndDelete(idOrUserId);
    }
  }
}
