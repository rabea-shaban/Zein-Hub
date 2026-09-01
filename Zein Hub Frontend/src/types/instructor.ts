export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
  youtube?: string;
}

export type RoleType =
  | "مدرب رئيسي"
  | "خبير زائر"
  | "مستشار تدريبي"
  | "Lead Instructor"
  | "Visiting Expert"
  | "Training Consultant";

export interface Instructor {
  id: string;
  name: string;
  nameEn?: string;
  title: string;
  titleEn?: string;
  bio: string;
  bioEn?: string;
  avatar: string;
  specialization: string[];
  specializationEn?: string[];
  experienceYears: number;
  featured: boolean;
  roleType?: string;
  roleTypeEn?: string;
  formerAffiliations?: string[];
  formerAffiliationsEn?: string[];
  philosophyQuote?: string;
  philosophyQuoteEn?: string;
  coursesTaught?: string[];
  coursesTaughtEn?: string[];
  achievements?: string[];
  achievementsEn?: string[];
  socialLinks?: SocialLinks;
}
