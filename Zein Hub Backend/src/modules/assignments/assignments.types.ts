import { AssignmentSubmissionType } from '../../constants/content.enum.js';

export interface ICreateAssignmentDTO {
  title: string;
  description: string;
  instructions?: string;
  submissionType?: AssignmentSubmissionType;
  maxScore?: number;
  deadline?: Date;
  isPublished?: boolean;
}

export interface IUpdateAssignmentDTO {
  title?: string;
  description?: string;
  instructions?: string;
  submissionType?: AssignmentSubmissionType;
  maxScore?: number;
  deadline?: Date;
  isPublished?: boolean;
}

export interface ISubmitAssignmentDTO {
  fileUrl?: string;
  textContent?: string;
}

export interface IGradeSubmissionDTO {
  grade: number;
  feedback?: string;
}
