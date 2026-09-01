import { EnrollmentStatus } from '../../constants/enrollmentStatus.enum.js';

export interface IUpdateEnrollmentStatusDTO {
  status: EnrollmentStatus;
  finalGrade?: number;
  certificateUrl?: string;
}

export interface IEnrollmentFilterQuery {
  programId?: string;
  studentId?: string;
  status?: EnrollmentStatus;
  search?: string;
  page?: number;
  limit?: number;
}
