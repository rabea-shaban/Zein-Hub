import { getPrograms } from "@/lib/content";
import { ProgramsPageClient } from "@/components/programs/ProgramsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "البرامج التدريبية | Programs",
  description: "استكشف البرامج والمسارات التدريبية العملية في مجالات الإعلام وصحافة الموبايل والتقديم التلفزيوني والبودكاست في صعيد مصر.",
};

export default function ProgramsPage() {
  const programs = getPrograms();

  return <ProgramsPageClient programs={programs} />;
}
