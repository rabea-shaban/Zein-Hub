import { LessonContentType } from '../../constants/content.enum.js';

export interface ILessonResourceDTO {
  title: string;
  fileUrl: string;
  type?: string;
}

export interface ICreateLessonDTO {
  title: string;
  description?: string;
  order?: number;
  contentType?: LessonContentType;
  contentUrl?: string;
  textBody?: string;
  resources?: ILessonResourceDTO[];
  durationMinutes?: number;
  isFreePreview?: boolean;
  isPublished?: boolean;
}

export interface IUpdateLessonDTO {
  title?: string;
  description?: string;
  order?: number;
  contentType?: LessonContentType;
  contentUrl?: string;
  textBody?: string;
  resources?: ILessonResourceDTO[];
  durationMinutes?: number;
  isFreePreview?: boolean;
  isPublished?: boolean;
}

export interface IReorderLessonDTO {
  order: number;
}

export interface IPublishLessonDTO {
  isPublished: boolean;
}
