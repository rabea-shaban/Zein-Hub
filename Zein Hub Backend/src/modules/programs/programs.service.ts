import mongoose from 'mongoose';
import { Program, IProgram } from '../../models/program.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { Track } from '../../models/track.model.js';
import { User } from '../../models/user.model.js';
import { InstructorProfile } from '../../models/instructorProfile.model.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ProgramStatus } from '../../constants/programStatus.enum.js';
import { ApiError } from '../../utils/apiError.js';
import { CourseModulesService } from '../courseModules/courseModules.service.js';
import {
  ICreateProgramDTO,
  IUpdateProgramDTO,
  IProgramFilterQuery,
} from './programs.types.js';

export class ProgramsService {
  /**
   * Helper to generate a slug from English title
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get all programs with searching, filtering, and pagination
   */
  public static async getAllPrograms(query: IProgramFilterQuery = {}): Promise<{
    programs: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const filter: Record<string, any> = { isActive: true };

    // Filter by Track Slug or Track ID
    if (query.trackSlug) {
      const track = await Track.findOne({ slug: query.trackSlug.toLowerCase() });
      if (track) {
        filter.trackId = track._id;
      } else {
        return {
          programs: [],
          meta: { total: 0, page: 1, limit: query.limit || 10, totalPages: 0 },
        };
      }
    } else if (query.trackId) {
      if (mongoose.Types.ObjectId.isValid(query.trackId)) {
        filter.trackId = query.trackId;
      }
    }

    // Filter by Program Status (open, coming-soon, closed)
    if (query.status) {
      filter.status = query.status;
    }

    // Filter by Featured flag
    if (typeof query.isFeatured === 'boolean') {
      filter.isFeatured = query.isFeatured;
    }

    // Text search in Arabic and English titles and descriptions
    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { titleAr: searchRegex },
        { titleEn: searchRegex },
        { descriptionAr: searchRegex },
        { descriptionEn: searchRegex },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'order';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: Record<string, any> = { [sortBy]: sortOrder, createdAt: 1 };

    const [programs, total] = await Promise.all([
      Program.find(filter)
        .populate('trackId', 'nameAr nameEn slug iconUrl')
        .populate('instructorId', 'fullName email avatarUrl role phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Program.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const programsWithCounts = await Promise.all(
      programs.map(async (prog) => {
        const studentsCount = await Enrollment.countDocuments({
          programId: prog._id,
        });
        return {
          ...prog.toObject(),
          studentsCount,
        };
      })
    );

    return {
      programs: programsWithCounts,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get featured programs (e.g. for homepage spotlight)
   */
  public static async getFeaturedPrograms(): Promise<IProgram[]> {
    return Program.find({ isFeatured: true, isActive: true })
      .populate('trackId', 'nameAr nameEn slug iconUrl')
      .populate('instructorId', 'fullName email avatarUrl role phone')
      .sort({ order: 1, createdAt: 1 });
  }

  /**
   * Get single program details along with assigned instructors
   */
  public static async getProgramByIdOrSlug(idOrSlug: string): Promise<any> {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isObjectId
      ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug.toLowerCase() }] }
      : { slug: idOrSlug.toLowerCase() };

    const program = await Program.findOne(filter)
      .populate('trackId', 'nameAr nameEn slug descriptionAr descriptionEn iconUrl')
      .populate('instructorId', 'fullName email avatarUrl role phone');

    if (!program) {
      throw ApiError.notFound(`Program '${idOrSlug}' not found`);
    }

    // Find instructors assigned to this program
    const instructorProfiles = await InstructorProfile.find({
      $or: [
        { assignedPrograms: program._id },
        { userId: program.instructorId },
      ],
      isActive: true,
    }).populate('userId', 'fullName email phone avatarUrl');

    const instructors = instructorProfiles.map((prof) => ({
      instructorProfileId: prof._id,
      bio: prof.bio,
      specializations: prof.specializations,
      experienceYears: prof.experienceYears,
      photoUrl: prof.photoUrl,
      reelUrl: prof.reelUrl,
      user: prof.userId,
    }));

    const studentsCount = await Enrollment.countDocuments({
      programId: program._id,
    });

    // Fetch live modules and lessons created by the assigned instructor
    let modules: any[] = [];
    try {
      modules = await CourseModulesService.getProgramModules(program._id.toString());
    } catch (e) {
      console.warn('Failed to load live modules for program:', e);
    }

    return {
      program: {
        ...program.toObject(),
        studentsCount,
        modules,
      },
      instructors,
      modules,
    };
  }

  /**
   * Create a new program (Super Admin only)
   */
  public static async createProgram(dto: any): Promise<IProgram> {
    const track = await Track.findById(dto.trackId);
    if (!track) {
      throw ApiError.notFound('Track referenced by trackId not found');
    }

    const slug = dto.slug ? dto.slug.toLowerCase().trim() : this.generateSlug(dto.titleEn);

    const existingSlug = await Program.findOne({ slug });
    if (existingSlug) {
      throw ApiError.conflict(`Program with slug '${slug}' already exists`);
    }

    const program = new Program({
      titleAr: dto.titleAr.trim(),
      titleEn: dto.titleEn.trim(),
      slug,
      trackId: dto.trackId,
      instructorId: dto.instructorId ? new mongoose.Types.ObjectId(dto.instructorId) : undefined,
      descriptionAr: dto.descriptionAr.trim(),
      descriptionEn: dto.descriptionEn?.trim(),
      objectives: dto.objectives || [],
      targetAudience: dto.targetAudience || [],
      targetAudienceEn: dto.targetAudienceEn || [],
      learningOutcomes: dto.learningOutcomes || [],
      learningOutcomesEn: dto.learningOutcomesEn || [],
      curriculum: dto.curriculum || [],
      toolsAndGear: dto.toolsAndGear || [],
      toolsAndGearEn: dto.toolsAndGearEn || [],
      capstoneProject: dto.capstoneProject || undefined,
      prerequisites: dto.prerequisites || [],
      prerequisitesEn: dto.prerequisitesEn || [],
      locationDetails: dto.locationDetails,
      locationDetailsEn: dto.locationDetailsEn,
      status: dto.status || ProgramStatus.COMING_SOON,
      isFeatured: dto.isFeatured ?? false,
      coverImageUrl: dto.coverImageUrl?.trim() || null,
      promoVideoUrl: dto.promoVideoUrl?.trim() || null,
      durationWeeks: dto.durationWeeks ?? 4,
      durationHours: dto.durationHours ?? dto.totalHours ?? 20,
      totalHours: dto.totalHours ?? 20,
      price: dto.price ?? 0,
      currency: dto.currency?.trim() || 'EGP',
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    await program.save();

    // If instructor was assigned, automatically update their InstructorProfile.assignedPrograms
    if (dto.instructorId) {
      await InstructorProfile.findOneAndUpdate(
        { userId: dto.instructorId },
        { $addToSet: { assignedPrograms: program._id } }
      );
    }

    return program;
  }

  /**
   * Update program details (Super Admin only)
   */
  public static async updateProgram(id: string, dto: any): Promise<IProgram> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(id);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    if (dto.trackId && dto.trackId !== program.trackId.toString()) {
      const track = await Track.findById(dto.trackId);
      if (!track) {
        throw ApiError.notFound('Track not found');
      }
      program.trackId = new mongoose.Types.ObjectId(dto.trackId);
    }

    if (dto.slug && dto.slug.toLowerCase() !== program.slug) {
      const existingSlug = await Program.findOne({ slug: dto.slug.toLowerCase(), _id: { $ne: id } });
      if (existingSlug) {
        throw ApiError.conflict(`Program with slug '${dto.slug}' already exists`);
      }
      program.slug = dto.slug.toLowerCase().trim();
    }

    if (dto.titleAr) program.titleAr = dto.titleAr.trim();
    if (dto.titleEn) program.titleEn = dto.titleEn.trim();
    if (dto.descriptionAr) program.descriptionAr = dto.descriptionAr.trim();
    if (dto.descriptionEn !== undefined) program.descriptionEn = dto.descriptionEn?.trim() || undefined;
    if (dto.instructorId !== undefined) {
      program.instructorId = dto.instructorId ? new mongoose.Types.ObjectId(dto.instructorId) : undefined;
      if (dto.instructorId) {
        await InstructorProfile.findOneAndUpdate(
          { userId: dto.instructorId },
          { $addToSet: { assignedPrograms: program._id } }
        );
      }
    }
    if (dto.learningOutcomes !== undefined) program.learningOutcomes = dto.learningOutcomes;
    if (dto.learningOutcomesEn !== undefined) program.learningOutcomesEn = dto.learningOutcomesEn;
    if (dto.curriculum !== undefined) program.curriculum = dto.curriculum;
    if (dto.toolsAndGear !== undefined) program.toolsAndGear = dto.toolsAndGear;
    if (dto.toolsAndGearEn !== undefined) program.toolsAndGearEn = dto.toolsAndGearEn;
    if (dto.capstoneProject !== undefined) program.capstoneProject = dto.capstoneProject;
    if (dto.prerequisites !== undefined) program.prerequisites = dto.prerequisites;
    if (dto.prerequisitesEn !== undefined) program.prerequisitesEn = dto.prerequisitesEn;
    if (dto.objectives !== undefined) program.objectives = dto.objectives;
    if (dto.targetAudience !== undefined) program.targetAudience = dto.targetAudience;
    if (dto.targetAudienceEn !== undefined) program.targetAudienceEn = dto.targetAudienceEn;
    if (dto.status !== undefined) program.status = dto.status;
    if (dto.isFeatured !== undefined) program.isFeatured = dto.isFeatured;
    if (dto.coverImageUrl !== undefined) program.coverImageUrl = dto.coverImageUrl?.trim() || undefined;
    if (dto.promoVideoUrl !== undefined) program.promoVideoUrl = dto.promoVideoUrl?.trim() || undefined;
    if (dto.durationWeeks !== undefined) program.durationWeeks = dto.durationWeeks;
    if (dto.durationHours !== undefined) program.durationHours = dto.durationHours;
    if (dto.totalHours !== undefined) program.totalHours = dto.totalHours;
    if (dto.price !== undefined) program.price = dto.price;
    if (dto.currency !== undefined) program.currency = dto.currency?.trim() || 'EGP';
    if (dto.order !== undefined) program.order = dto.order;
    if (dto.isActive !== undefined) program.isActive = dto.isActive;

    await program.save();
    return program;
  }

  /**
   * Change program status (open, coming-soon, closed)
   */
  public static async changeStatus(id: string, status: ProgramStatus): Promise<IProgram> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(id);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    program.status = status;
    await program.save();
    return program;
  }

  /**
   * Toggle program featured status
   */
  public static async toggleFeatured(id: string): Promise<IProgram> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(id);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    program.isFeatured = !program.isFeatured;
    await program.save();
    return program;
  }

  /**
   * Assign an instructor to a program (Many-to-Many via InstructorProfile.assignedPrograms)
   */
  public static async assignInstructor(programId: string, instructorUserId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(programId) || !mongoose.Types.ObjectId.isValid(instructorUserId)) {
      throw ApiError.badRequest('Invalid Program ID or Instructor ID format');
    }

    const program = await Program.findById(programId);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    // Strict Check 1: User must exist and have role === instructor
    const user = await User.findById(instructorUserId);
    if (!user) {
      throw ApiError.notFound('Instructor user not found');
    }

    if (user.role !== UserRole.INSTRUCTOR) {
      throw ApiError.badRequest(
        `User ${user.email} has role '${user.role}' and cannot be assigned as an instructor. Role must be 'instructor'.`
      );
    }

    // Strict Check 2: Remove program from previous instructor if exists
    if (program.instructorId && program.instructorId.toString() !== user._id.toString()) {
      await InstructorProfile.findOneAndUpdate(
        { userId: program.instructorId },
        { $pull: { assignedPrograms: program._id } }
      );
    }

    // Set single instructor on program
    program.instructorId = user._id as any;
    await program.save();

    // Strict Check 3: Find or initialize InstructorProfile and add program
    let instructorProfile = await InstructorProfile.findOne({ userId: user._id });
    if (!instructorProfile) {
      instructorProfile = new InstructorProfile({
        userId: user._id,
        bio: `Instructor for ${program.titleEn}`,
        specializations: [],
        assignedPrograms: [program._id as any],
        isActive: true,
      });
    } else {
      const alreadyAssigned = instructorProfile.assignedPrograms.some(
        (id) => id.toString() === program._id.toString()
      );
      if (!alreadyAssigned) {
        instructorProfile.assignedPrograms.push(program._id as any);
      }
    }

    await instructorProfile.save();

    return {
      assigned: true,
      instructor: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      program: {
        id: program._id,
        titleEn: program.titleEn,
        slug: program.slug,
      },
      totalAssignedPrograms: instructorProfile.assignedPrograms.length,
    };
  }

  /**
   * Unassign an instructor from a program
   */
  public static async unassignInstructor(programId: string, instructorUserId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(programId) || !mongoose.Types.ObjectId.isValid(instructorUserId)) {
      throw ApiError.badRequest('Invalid Program ID or Instructor ID format');
    }

    const program = await Program.findById(programId);
    if (program && program.instructorId?.toString() === instructorUserId) {
      program.instructorId = undefined;
      await program.save();
    }

    const instructorProfile = await InstructorProfile.findOne({ userId: instructorUserId });
    if (!instructorProfile) {
      throw ApiError.notFound('Instructor profile not found');
    }

    instructorProfile.assignedPrograms = instructorProfile.assignedPrograms.filter(
      (id) => id.toString() !== programId.toString()
    );

    await instructorProfile.save();

    return {
      unassigned: true,
      programId,
      instructorUserId,
      remainingAssignedPrograms: instructorProfile.assignedPrograms.length,
    };
  }

  /**
   * Delete or deactivate a program
   */
  public static async deleteProgram(id: string): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(id);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    program.isActive = false;
    await program.save();
    return { deleted: true };
  }
}
