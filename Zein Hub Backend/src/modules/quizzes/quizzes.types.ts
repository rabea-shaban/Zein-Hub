import { QuestionType } from '../../constants/content.enum.js';

export interface IQuestionOptionDTO {
  text: string;
  isCorrect: boolean;
}

export interface ICreateQuestionDTO {
  prompt: string;
  type?: QuestionType;
  options: IQuestionOptionDTO[];
  explanation?: string;
  points?: number;
  order?: number;
}

export interface IUpdateQuestionDTO {
  prompt?: string;
  type?: QuestionType;
  options?: IQuestionOptionDTO[];
  explanation?: string;
  points?: number;
  order?: number;
}

export interface ICreateQuizDTO {
  title: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number;
  durationMinutes?: number;
  isPublished?: boolean;
}

export interface IUpdateQuizDTO {
  title?: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number;
  durationMinutes?: number;
  isPublished?: boolean;
}

export interface ISubmitQuizAnswerDTO {
  questionId: string;
  selectedOptionIndices: number[];
}

export interface ISubmitQuizDTO {
  answers: ISubmitQuizAnswerDTO[];
}
