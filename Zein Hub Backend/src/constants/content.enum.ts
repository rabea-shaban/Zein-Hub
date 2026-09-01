export enum LessonContentType {
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  PDF = 'pdf',
}

export enum QuestionType {
  MCQ = 'mcq',
  TRUE_FALSE = 'true_false',
  MULTIPLE_ANSWERS = 'multiple_answers',
  SHORT_ANSWER = 'short_answer',
}

export enum AssignmentSubmissionType {
  AUDIO = 'audio',
  VIDEO = 'video',
  PDF = 'pdf',
  TEXT = 'text',
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

export enum LiveSessionProvider {
  GOOGLE_MEET = 'google_meet',
  ZOOM = 'zoom',
  TEAMS = 'teams',
  OTHER = 'other',
}

export enum LiveSessionStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  LATE = 'late',
  ABSENT = 'absent',
  EXCUSED = 'excused',
}
