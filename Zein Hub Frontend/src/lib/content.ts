import { Program } from "@/types/program";
import { Instructor } from "@/types/instructor";
import {
  Testimonial,
  FAQItem,
  FeatureItem,
  ValueItem,
  PhilosophyPillar,
  TrainingStage,
  StatMetric,
  SiteConfig,
  TargetRegion,
  NavLink,
} from "@/types/site";
import { SAMPLE_PROGRAMS } from "@/data/programs";
import { SAMPLE_INSTRUCTORS } from "@/data/instructors";
import { SAMPLE_TESTIMONIALS } from "@/data/testimonials";
import { SAMPLE_FAQS } from "@/data/faqs";
import {
  WHY_ZEIN_HUB_ITEMS,
  CORE_VALUES_ITEMS,
  PHILOSOPHY_PILLARS,
  TRAINING_STAGES,
  IMPACT_STATS,
} from "@/data/features";
import { SITE_CONFIG, TARGET_REGIONS, NAV_LINKS } from "./constants";

/**
 * Centralized Content Accessor Layer for Zein Hub.
 * Abstracted to allow seamless migration to an API or Headless CMS without changing UI components.
 */

/* ==================== Programs ==================== */
export function getPrograms(): Program[] {
  return SAMPLE_PROGRAMS;
}

export function getProgramBySlug(slug: string): Program | undefined {
  if (!slug) return undefined;

  // 1. Direct exact match
  const exact = SAMPLE_PROGRAMS.find((p) => p.slug === slug || p.id === slug);
  if (exact) return exact;

  // 2. Slug prefix or alias matching (handles "news-anchoring-media-presentation" -> "news-anchoring")
  const cleanSearch = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return SAMPLE_PROGRAMS.find((p) => {
    const pClean = p.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      pClean === cleanSearch ||
      cleanSearch.startsWith(pClean) ||
      pClean.startsWith(cleanSearch) ||
      p.slug.startsWith(slug) ||
      slug.startsWith(p.slug)
    );
  });
}

export function getFeaturedPrograms(): Program[] {
  return SAMPLE_PROGRAMS.filter((p) => p.featured);
}

export function getProgramsByTrack(trackId: string): Program[] {
  return SAMPLE_PROGRAMS.filter((p) => p.trackId === trackId);
}

/* ==================== Instructors ==================== */
export function getInstructors(): Instructor[] {
  return SAMPLE_INSTRUCTORS;
}

export function getInstructorById(id?: string): Instructor | undefined {
  if (!id) return undefined;
  return SAMPLE_INSTRUCTORS.find((i) => i.id === id);
}

export function getFeaturedInstructors(): Instructor[] {
  return SAMPLE_INSTRUCTORS.filter((i) => i.featured);
}

/* ==================== Testimonials ==================== */
export function getTestimonials(): Testimonial[] {
  return SAMPLE_TESTIMONIALS;
}

/* ==================== FAQs ==================== */
export function getFaqs(): FAQItem[] {
  return SAMPLE_FAQS;
}

export function getFaqsByCategory(category: string): FAQItem[] {
  return SAMPLE_FAQS.filter((f) => f.category === category);
}

/* ==================== Features & Value Props ==================== */
export function getWhyZeinHubItems(): FeatureItem[] {
  return WHY_ZEIN_HUB_ITEMS;
}

export function getCoreValues(): ValueItem[] {
  return CORE_VALUES_ITEMS;
}

export function getPhilosophyPillars(): PhilosophyPillar[] {
  return PHILOSOPHY_PILLARS;
}

export function getTrainingStages(): TrainingStage[] {
  return TRAINING_STAGES;
}

export function getImpactStats(): StatMetric[] {
  return IMPACT_STATS;
}

/* ==================== Site Settings ==================== */
export function getSiteConfig(): SiteConfig {
  return SITE_CONFIG;
}

export function getTargetRegions(): TargetRegion[] {
  return TARGET_REGIONS;
}

export function getNavLinks(): NavLink[] {
  return NAV_LINKS;
}
