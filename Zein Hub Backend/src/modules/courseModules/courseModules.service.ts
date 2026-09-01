import mongoose from 'mongoose';
import { Module, IModule } from '../../models/module.model.js';
import { Lesson, ILesson } from '../../models/lesson.model.js';
import { Program } from '../../models/program.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { InstructorProfile } from '../../models/instructorProfile.model.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  ICreateModuleDTO,
  IUpdateModuleDTO,
  IReorderModuleDTO,
} from './courseModules.types.js';

export class CourseModulesService {
  /**
   * Check whether a user has full access to paid program content
   */
  public static async hasFullProgramAccess(
    userId: string | undefined,
    userRole: UserRole | undefined,
    programId: string
  ): Promise<boolean> {
    if (!userId || !userRole) {
      return false;
    }

    if (userRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    if (userRole === UserRole.INSTRUCTOR) {
      const profile = await InstructorProfile.findOne({ userId, isActive: true });
      if (!profile) return false;
      return profile.assignedPrograms.some(
        (pid) => pid.toString() === programId.toString()
      );
    }

    if (userRole === UserRole.STUDENT) {
      const enrollment = await Enrollment.findOne({
        studentId: userId,
        programId,
        status: { $in: ['active', 'completed'] },
      } as any);
      return !!enrollment;
    }

    return false;
  }

  /**
   * Verify if a user (Super Admin or Assigned Instructor) has write permission to program
   */
  public static async verifyProgramWriteAccess(
    userId: string,
    userRole: UserRole,
    programId: string
  ): Promise<void> {
    if (userRole === UserRole.SUPER_ADMIN) {
      return;
    }

    if (userRole === UserRole.INSTRUCTOR) {
      const profile = await InstructorProfile.findOne({ userId, isActive: true });
      if (!profile) {
        throw ApiError.forbidden('Forbidden: Instructor profile not found or inactive');
      }

      const isAssigned = profile.assignedPrograms.some(
        (pid) => pid.toString() === programId.toString()
      );

      if (!isAssigned) {
        throw ApiError.forbidden(
          'Forbidden: You are not authorized to manage content for this program'
        );
      }
      return;
    }

    throw ApiError.forbidden('Forbidden: Only authorized instructors and admins can manage course content');
  }

  /**
   * Get curriculum outline of modules and lessons for a program with content sanitization
   */
  public static async getProgramModules(
    programId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(programId);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    const hasFullAccess = await this.hasFullProgramAccess(userId, userRole, programId);

    // If Instructor or Super Admin, show unpublished modules too; otherwise only published
    const isPrivileged = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.INSTRUCTOR;
    const moduleFilter: Record<string, any> = {
      programId,
      ...(isPrivileged ? {} : { isPublished: true }),
    };

    const modules = await Module.find(moduleFilter).sort({ order: 1, createdAt: 1 });

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessonFilter: Record<string, any> = {
          moduleId: mod._id,
          ...(isPrivileged ? {} : { isPublished: true }),
        };

        const lessons = await Lesson.find(lessonFilter).sort({ order: 1, createdAt: 1 });

        // Sanitize lessons: conceal paid video/audio/files for users without full access
        const sanitizedLessons = lessons.map((les) => {
          const isAccessible = hasFullAccess || les.isFreePreview;

          return {
            _id: les._id,
            moduleId: les.moduleId,
            programId: les.programId,
            title: les.title,
            description: les.description,
            order: les.order,
            contentType: les.contentType,
            durationMinutes: les.durationMinutes,
            isFreePreview: les.isFreePreview,
            isPublished: les.isPublished,
            isLocked: !isAccessible,
            contentUrl: isAccessible ? les.contentUrl : null,
            textBody: isAccessible ? les.textBody : null,
            resources: isAccessible ? les.resources : [],
            createdAt: les.createdAt,
            updatedAt: les.updatedAt,
          };
        });

        return {
          ...mod.toObject(),
          totalLessons: lessons.length,
          lessons: sanitizedLessons,
        };
      })
    );

    return modulesWithLessons;
  }

  /**
   * Get single module details with its lessons
   */
  public static async getModuleById(
    moduleId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      throw ApiError.badRequest('Invalid module ID format');
    }

    const mod = await Module.findById(moduleId);
    if (!mod) {
      throw ApiError.notFound('Module not found');
    }

    const hasFullAccess = await this.hasFullProgramAccess(userId, userRole, mod.programId.toString());
    const isPrivileged = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.INSTRUCTOR;

    const lessonFilter: Record<string, any> = {
      moduleId: mod._id,
      ...(isPrivileged ? {} : { isPublished: true }),
    };

    const lessons = await Lesson.find(lessonFilter).sort({ order: 1, createdAt: 1 });

    const sanitizedLessons = lessons.map((les) => {
      const isAccessible = hasFullAccess || les.isFreePreview;
      return {
        _id: les._id,
        moduleId: les.moduleId,
        programId: les.programId,
        title: les.title,
        description: les.description,
        order: les.order,
        contentType: les.contentType,
        durationMinutes: les.durationMinutes,
        isFreePreview: les.isFreePreview,
        isPublished: les.isPublished,
        isLocked: !isAccessible,
        contentUrl: isAccessible ? les.contentUrl : null,
        textBody: isAccessible ? les.textBody : null,
        resources: isAccessible ? les.resources : [],
      };
    });

    return {
      module: mod.toObject(),
      lessons: sanitizedLessons,
    };
  }

  /**
   * Create a new Module for a Program
   */
  public static async createModule(
    programId: string,
    userId: string,
    userRole: UserRole,
    dto: ICreateModuleDTO
  ): Promise<IModule> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(programId);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    await this.verifyProgramWriteAccess(userId, userRole, programId);

    // Determine default order if not provided
    let order = dto.order;
    if (order === undefined) {
      const count = await Module.countDocuments({ programId } as any);
      order = count + 1;
    }

    const module = new Module({
      programId: new mongoose.Types.ObjectId(programId),
      title: dto.title.trim(),
      description: dto.description?.trim() || undefined,
      order,
      isPublished: dto.isPublished ?? true,
    });

    await module.save();
    return module;
  }

  /**
   * Update an existing module
   */
  public static async updateModule(
    moduleId: string,
    userId: string,
    userRole: UserRole,
    dto: IUpdateModuleDTO
  ): Promise<IModule> {
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      throw ApiError.badRequest('Invalid module ID format');
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      throw ApiError.notFound('Module not found');
    }

    await this.verifyProgramWriteAccess(userId, userRole, module.programId.toString());

    if (dto.title) module.title = dto.title.trim();
    if (dto.description !== undefined) module.description = dto.description?.trim() || undefined;
    if (dto.order !== undefined) module.order = dto.order;
    if (dto.isPublished !== undefined) module.isPublished = dto.isPublished;

    await module.save();
    return module;
  }

  /**
   * Reorder module
   */
  public static async reorderModule(
    moduleId: string,
    userId: string,
    userRole: UserRole,
    dto: IReorderModuleDTO
  ): Promise<IModule> {
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      throw ApiError.badRequest('Invalid module ID format');
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      throw ApiError.notFound('Module not found');
    }

    await this.verifyProgramWriteAccess(userId, userRole, module.programId.toString());

    module.order = dto.order;
    await module.save();
    return module;
  }

  /**
   * Delete module and clean up linked lessons to avoid orphaned data
   */
  public static async deleteModule(
    moduleId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ deleted: boolean; deletedLessonsCount: number }> {
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      throw ApiError.badRequest('Invalid module ID format');
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      throw ApiError.notFound('Module not found');
    }

    await this.verifyProgramWriteAccess(userId, userRole, module.programId.toString());

    // Cascade delete lessons belonging to this module
    const deleteResult = await Lesson.deleteMany({ moduleId: module._id });
    await Module.findByIdAndDelete(moduleId);

    return {
      deleted: true,
      deletedLessonsCount: deleteResult.deletedCount || 0,
    };
  }
}
