import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { ApiError } from '../utils/apiError.js';
import { InstructorProfile } from '../models/instructorProfile.model.js';

export const verifyInstructorProgramAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Super Admin has unrestricted access to all programs
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // For Instructors, check specific program assignment
    if (req.user.role === UserRole.INSTRUCTOR) {
      const programId =
        req.params.programId ||
        req.body?.programId ||
        (req.query?.programId as string | undefined);

      if (!programId) {
        return next(
          ApiError.badRequest('Program ID is required to verify instructor authorization')
        );
      }

      const instructorProfile = await InstructorProfile.findOne({
        userId: req.user.id,
        isActive: true,
      });

      if (!instructorProfile) {
        return next(
          ApiError.forbidden('Forbidden: Instructor profile not found or inactive')
        );
      }

      const isAssigned = instructorProfile.assignedPrograms.some(
        (assignedId) => assignedId.toString() === programId.toString()
      );

      if (!isAssigned) {
        return next(
          ApiError.forbidden('Forbidden: You are not assigned to manage this program')
        );
      }

      return next();
    }

    // Any other role
    return next(
      ApiError.forbidden('Forbidden: Access restricted to authorized instructors and admins')
    );
  } catch (error) {
    next(error);
  }
};
