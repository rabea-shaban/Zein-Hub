import { AboutHero } from "@/components/about/AboutHero";
import { VisionMissionValues } from "@/components/about/VisionMissionValues";
import { WhyZeinHub } from "@/components/home/WhyZeinHub";
import { TrainingPhilosophy } from "@/components/about/TrainingPhilosophy";
import { InstructorsSection } from "@/components/home/InstructorsSection";
import { AccreditationPartnerships } from "@/components/about/AccreditationPartnerships";
import { TrustCTA } from "@/components/about/TrustCTA";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "عن Zein Hub — الرؤية والرسالة والاعتماد | About Us",
  description:
    "تعرف على رؤية ورسالة Zein Hub، فلسفة التدريب الإعلامي التطبيقي، ومعايير الشراكات والاعتماد لشباب صعيد مصر.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-slate-50 dark:bg-navy-950 min-h-screen transition-colors duration-300">
      {/* 1. About Zein Hub Hero */}
      <AboutHero />

      {/* 2. Vision, Mission & Core Values */}
      <VisionMissionValues />

      {/* 3. Why Zein Hub (Key Differentiators) */}
      <WhyZeinHub />

      {/* 4. Media Training Philosophy */}
      <TrainingPhilosophy />

      {/* 5. Instructors Preview */}
      <InstructorsSection />

      {/* 6. Partnerships & Accreditation Positioning */}
      <AccreditationPartnerships />

      {/* 7. Trust CTA */}
      <TrustCTA />
    </div>
  );
}
