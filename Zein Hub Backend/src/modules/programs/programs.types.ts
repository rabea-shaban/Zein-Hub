import { ProgramStatus } from '../../constants/programStatus.enum.js';

export interface ICreateProgramDTO {
  titleAr: string;
  titleEn: string;
  slug?: string;
  trackId: string;
  descriptionAr: string;
  descriptionEn?: string;
  objectives?: string[];
  targetAudience?: string[];
  status?: ProgramStatus;
  isFeatured?: boolean;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  durationWeeks?: number;
  totalHours?: number;
  price?: number;
  currency?: string;
  order?: number;
  isActive?: boolean;
}

export interface IUpdateProgramDTO {
  titleAr?: string;
  titleEn?: string;
  slug?: string;
  trackId?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  objectives?: string[];
  targetAudience?: string[];
  status?: ProgramStatus;
  isFeatured?: boolean;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  durationWeeks?: number;
  totalHours?: number;
  price?: number;
  currency?: string;
  order?: number;
  isActive?: boolean;
}

export interface IProgramFilterQuery {
  trackId?: string;
  trackSlug?: string;
  status?: ProgramStatus;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IAssignInstructorDTO {
  instructorId: string; // User ID with role instructor
}
