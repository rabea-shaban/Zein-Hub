export interface SiteSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  taglineEn?: string;
  description: string;
  descriptionEn?: string;
  url: string;
  email: string;
  phone: string;
  whatsapp: string;
  workingHours: string;
  workingHoursEn?: string;
  socials: SiteSocialLinks;
}

export interface NavLink {
  label: string;
  labelEn?: string;
  href: string;
}

export interface TargetRegion {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface Testimonial {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  roleEn?: string;
  city: string;
  cityEn?: string;
  programTitle: string;
  programTitleEn?: string;
  quote: string;
  quoteEn?: string;
  avatar: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
  category?: "programs" | "admission" | "equipment" | "general";
}

export interface ValueItem {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  iconName: string;
}

export interface PhilosophyPillar {
  id: string;
  num: string;
  label: string;
  labelEn?: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  iconName: string;
}

export interface TrainingStage {
  step: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  tag: string;
  tagEn?: string;
  iconName: string;
}

export interface StatMetric {
  id: string;
  value: string;
  label: string;
  labelEn?: string;
  detail: string;
  detailEn?: string;
  iconName: string;
}
