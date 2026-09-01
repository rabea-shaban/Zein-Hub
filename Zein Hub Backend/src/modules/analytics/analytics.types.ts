export interface IDashboardOverviewKPIs {
  users: {
    totalStudents: number;
    totalInstructors: number;
    activeStudents: number;
  };
  programs: {
    total: number;
    open: number;
    comingSoon: number;
    closed: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  academic: {
    averageCompletionRate: number;
    averageFinalGrade: number;
    totalCertificatesIssued: number;
  };
  attendance: {
    overallAttendanceRate: number;
    totalLiveSessions: number;
  };
  reviews: {
    averagePlatformRating: number;
    totalReviews: number;
    pendingModerationCount: number;
  };
}

export interface IEnrollmentAnalytics {
  totalEnrollments: number;
  byStatus: {
    active: number;
    completed: number;
    cancelled: number;
  };
  byTrack: Array<{
    trackId: string;
    trackNameAr: string;
    trackNameEn: string;
    enrollmentCount: number;
  }>;
  byProgram: Array<{
    programId: string;
    programTitleAr: string;
    programTitleEn: string;
    enrollmentCount: number;
    completedCount: number;
    completionRate: number;
  }>;
}

export interface IProgressAnalytics {
  averageCompletionPercentage: number;
  progressTiers: {
    tier0to24: number;
    tier25to49: number;
    tier50to74: number;
    tier75to99: number;
    tier100: number;
  };
  programsProgress: Array<{
    programId: string;
    programTitleAr: string;
    programTitleEn: string;
    enrolledStudents: number;
    averageCompletionPercentage: number;
  }>;
}

export interface IAttendanceAnalytics {
  overallAttendanceRate: number;
  totalSessionsConducted: number;
  attendanceBreakdown: {
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
  programsAttendance: Array<{
    programId: string;
    programTitleAr: string;
    programTitleEn: string;
    totalSessions: number;
    attendanceRate: number;
  }>;
}

export interface IAssessmentAnalytics {
  quizzes: {
    totalQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
  assignments: {
    totalAssignments: number;
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingGradingSubmissions: number;
    averageGrade: number;
  };
}

export interface ICertificateAnalytics {
  totalCertificatesIssued: number;
  completionConversionRate: number;
  issuedThisMonth: number;
  byProgram: Array<{
    programId: string;
    programTitleAr: string;
    programTitleEn: string;
    certificatesCount: number;
  }>;
}

export interface IReviewsAnalytics {
  averagePlatformRating: number;
  totalReviews: number;
  statusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
  };
  starDistribution: Record<number, number>;
  featuredReviewsCount: number;
}

export interface IProgramDetailedReport {
  program: {
    id: string;
    titleAr: string;
    titleEn: string;
    slug: string;
    status: string;
    price: number;
  };
  metrics: {
    totalApplications: number;
    totalEnrollments: number;
    activeStudents: number;
    graduatedStudents: number;
    completionRate: number;
    averageFinalGrade: number;
    totalCertificates: number;
    totalLiveSessions: number;
    attendanceRate: number;
    averageRating: number;
    totalReviews: number;
  };
}
