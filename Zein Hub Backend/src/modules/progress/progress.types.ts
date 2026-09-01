export interface IProgramProgressSummary {
  programId: string;
  programTitle: string;
  totalLessons: number;
  completedLessonsCount: number;
  completionPercentage: number;
  quizzesTotal: number;
  quizzesPassed: number;
  assignmentsTotal: number;
  assignmentsGraded: number;
  finalGrade?: number;
  isCompleted: boolean;
  certificateUrl?: string;
  certificateNumber?: string;
  lastActivityAt: Date;
}

export interface IRecalculateProgressResult {
  studentId: string;
  programId: string;
  completionPercentage: number;
  finalGrade: number | null;
  status: string;
  isCompleted: boolean;
  certificateIssued: boolean;
  certificateNumber?: string;
}
