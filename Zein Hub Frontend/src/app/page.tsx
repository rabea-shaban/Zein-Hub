import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedPrograms } from "@/components/home/FeaturedPrograms";
import { WhyZeinHub } from "@/components/home/WhyZeinHub";
import { TrainingShowcase } from "@/components/home/TrainingShowcase";
import { ValueProposition } from "@/components/home/ValueProposition";
import { TrainingExperience } from "@/components/home/TrainingExperience";
import { InstructorsSection } from "@/components/home/InstructorsSection";
import { ImpactStats } from "@/components/home/ImpactStats";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-navy-50 dark:bg-navy-950 transition-colors duration-300">
      {/* 1. Hero Section (Text + Interactive Media) */}
      <HeroSection />

      {/* 2. Featured Media Programs (Visual Cards) */}
      <FeaturedPrograms />

      {/* 3. Why Zein Hub? (Key Differentiators & Icons) */}
      <WhyZeinHub />

      {/* 4. Inside the Studio & Training Showcase (Media Gallery & Video Previews) */}
      <TrainingShowcase />

      {/* 5. Value Proposition & Problem vs Solution */}
      <ValueProposition />

      {/* 6. Media Training Experience (4 Stages Journey) */}
      <TrainingExperience />

      {/* 7. Instructors (Portraits & Experience) */}
      <InstructorsSection />

      {/* 8. Impact / Statistics */}
      <ImpactStats />

      {/* 9. Testimonials */}
      <TestimonialsSection />

      {/* 10. Final CTA */}
      <FinalCTA />
    </div>
  );
}
