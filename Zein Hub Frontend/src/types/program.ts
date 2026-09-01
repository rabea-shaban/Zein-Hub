export type ProgramStatus = "open" | "coming-soon" | "closed";

export type ProgramLevel =
  | "مبتدئ"
  | "متوسط"
  | "متقدم"
  | "جميع المستويات"
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "All Levels";

export type ProgramFormat =
  | "حضوري"
  | "أونلاين"
  | "مدمج (Hybrid)"
  | "In-Studio"
  | "Online"
  | "Hybrid (Studio + Field)";

export interface ProgramCurriculumWeek {
  weekNumber: number;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  topics: string[];
  topicsEn?: string[];
  practicalProject: string;
  practicalProjectEn?: string;
}

export interface Program {
  id: string;
  slug: string;
  trackId: "audio-media" | "tech-ai" | "strategic-pr";
  status: ProgramStatus;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  description: string;
  descriptionEn?: string;
  category: string;
  categoryEn?: string;
  level: string;
  levelEn?: string;
  format: string;
  formatEn?: string;
  durationWeeks: number;
  totalHours: number;
  weeklyHours: number;
  featured: boolean;
  image: string;
  imageAlt?: string;
  imageAltEn?: string;
  instructorId?: string;
  instructorReelUrl?: string;
  targetAudience: string[];
  targetAudienceEn?: string[];
  learningOutcomes: string[];
  learningOutcomesEn?: string[];
  curriculum: ProgramCurriculumWeek[];
  toolsAndGear: string[];
  toolsAndGearEn?: string[];
  capstoneProject: {
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    deliverable: string;
    deliverableEn?: string;
  };
  prerequisites: string[];
  prerequisitesEn?: string[];
  locationDetails?: string;
  locationDetailsEn?: string;
}
