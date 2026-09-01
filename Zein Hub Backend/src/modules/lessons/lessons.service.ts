import mongoose from 'mongoose';
import { Lesson, ILesson } from '../../models/lesson.model.js';
import { Module } from '../../models/module.model.js';
import { CourseModulesService } from '../courseModules/courseModules.service.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  ICreateLessonDTO,
  IUpdateLessonDTO,
} from './lessons.types.js';

export class LessonsService {
  /**
   * Get lessons list for a module with content sanitization for non-enrolled users
   */
  public static async getLessonsByModule(
    moduleId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      throw ApiError.badRequest('Invalid module ID format');
    }

    const mod = await Module.findById(moduleId);
    if (!mod) {
      throw ApiError.notFound('Module not found');
    }

    const hasFullAccess = await CourseModulesService.hasFullProgramAccess(
      userId,
      userRole,
      mod.programId.toString()
    );

    const isPrivileged = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.INSTRUCTOR;
    const filter: Record<string, any> = {
      moduleId: mod._id,
      ...(isPrivileged ? {} : { isPublished: true }),
    };

    const lessons = await Lesson.find(filter).sort({ order: 1, createdAt: 1 });

    return lessons.map((les) => {
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
  }

  /**
   * Get full details of a single lesson (Checks Free Preview vs Active Enrollment/Instructor/Admin)
   */
  public static async getLessonById(
    lessonId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<ILesson> {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw ApiError.badRequest('Invalid lesson ID format');
    }

    const lesson = await Lesson.findById(lessonId).populate(
      'moduleId',
      'title description order'
    );

    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    const isPrivileged = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.INSTRUCTOR;
    if (!lesson.isPublished && !isPrivileged) {
      throw ApiError.notFound('Lesson is currently unavailable or unpublished');
    }

    const hasFullAccess = await CourseModulesService.hasFullProgramAccess(
      userId,
      userRole,
      lesson.programId.toString()
    );

    // If Paid Lesson and user doesn't have access -> Forbidden
    if (!lesson.isFreePreview && !hasFullAccess) {
      throw ApiError.forbidden('Active enrollment required to access this lesson');
    }

    return lesson;
  }

  /**
   * Create a new lesson under a module
   */
  public static async createLesson(
    moduleId: string,
    userId: string,
    userRole: UserRole,
    dto: ICreateLessonDTO
  ): Promise<ILesson> {
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      throw ApiError.badRequest('Invalid module ID format');
    }

    const mod = await Module.findById(moduleId);
    if (!mod) {
      throw ApiError.notFound('Module not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      mod.programId.toString()
    );

    let order = dto.order;
    if (order === undefined) {
      const count = await Lesson.countDocuments({ moduleId } as any);
      order = count + 1;
    }

    const lesson = new Lesson({
      moduleId: mod._id,
      programId: mod.programId,
      title: dto.title.trim(),
      description: dto.description?.trim() || undefined,
      order,
      contentType: dto.contentType,
      contentUrl: dto.contentUrl?.trim() || undefined,
      textBody: dto.textBody || undefined,
      resources: dto.resources || [],
      durationMinutes: dto.durationMinutes ?? 10,
      isFreePreview: dto.isFreePreview ?? false,
      isPublished: dto.isPublished ?? true,
    });

    await lesson.save();
    return lesson;
  }

  /**
   * Update lesson details
   */
  public static async updateLesson(
    lessonId: string,
    userId: string,
    userRole: UserRole,
    dto: IUpdateLessonDTO
  ): Promise<ILesson> {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw ApiError.badRequest('Invalid lesson ID format');
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      lesson.programId.toString()
    );

    if (dto.title) lesson.title = dto.title.trim();
    if (dto.description !== undefined) lesson.description = dto.description?.trim() || undefined;
    if (dto.order !== undefined) lesson.order = dto.order;
    if (dto.contentType !== undefined) lesson.contentType = dto.contentType;
    if (dto.contentUrl !== undefined) lesson.contentUrl = dto.contentUrl?.trim() || undefined;
    if (dto.textBody !== undefined) lesson.textBody = dto.textBody || undefined;
    if (dto.resources !== undefined) lesson.resources = dto.resources as any;
    if (dto.durationMinutes !== undefined) lesson.durationMinutes = dto.durationMinutes;
    if (dto.isFreePreview !== undefined) lesson.isFreePreview = dto.isFreePreview;
    if (dto.isPublished !== undefined) lesson.isPublished = dto.isPublished;

    await lesson.save();
    return lesson;
  }

  /**
   * Publish or unpublish a lesson
   */
  public static async publishLesson(
    lessonId: string,
    userId: string,
    userRole: UserRole,
    isPublished: boolean
  ): Promise<ILesson> {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw ApiError.badRequest('Invalid lesson ID format');
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      lesson.programId.toString()
    );

    lesson.isPublished = isPublished;
    await lesson.save();
    return lesson;
  }

  /**
   * Reorder a lesson within its module
   */
  public static async reorderLesson(
    lessonId: string,
    userId: string,
    userRole: UserRole,
    order: number
  ): Promise<ILesson> {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw ApiError.badRequest('Invalid lesson ID format');
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      lesson.programId.toString()
    );

    lesson.order = order;
    await lesson.save();
    return lesson;
  }

  /**
   * Delete a lesson
   */
  public static async deleteLesson(
    lessonId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw ApiError.badRequest('Invalid lesson ID format');
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      lesson.programId.toString()
    );

    await Lesson.findByIdAndDelete(lessonId);
    return { deleted: true };
  }
}
