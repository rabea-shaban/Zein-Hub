import { ReviewStatus } from '../../models/review.model.js';

export interface ICreateReviewDTO {
  rating: number;
  comment: string;
}

export interface IUpdateReviewDTO {
  rating?: number;
  comment?: string;
}

export interface IModerateReviewDTO {
  status: ReviewStatus;
  moderationNotes?: string;
  isFeatured?: boolean;
}

export interface IReviewQueryFilters {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  rating?: number;
  isFeatured?: boolean;
  programId?: string;
}
