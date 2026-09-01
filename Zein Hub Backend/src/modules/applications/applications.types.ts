import { ApplicationStatus } from '../../constants/applicationStatus.enum.js';

export interface ICreateApplicationDTO {
  programId: string;
  motivation?: string;
  portfolioUrl?: string;
  audioSampleUrl?: string;
  governorate?: string;
}

export interface IReviewApplicationDTO {
  status: ApplicationStatus.ACCEPTED | ApplicationStatus.REJECTED;
  reviewNotes?: string;
}

export interface IApplicationFilterQuery {
  programId?: string;
  studentId?: string;
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  limit?: number;
}
