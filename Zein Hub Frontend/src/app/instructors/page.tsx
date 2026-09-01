import { getInstructors } from "@/lib/content";
import { InstructorsPageClient } from "@/components/instructors/InstructorsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المدربون والخبراء الإعلاميون | Instructors",
  description:
    "تعرف على نخبة المدربين والمستشارين الإعلاميين في Zein Hub ذوي الخبرة في كبرى القنوات والمنصات العالمية.",
};

export default function InstructorsPage() {
  const instructors = getInstructors();

  return <InstructorsPageClient instructors={instructors} />;
}
