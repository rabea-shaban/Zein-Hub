import { notFound } from "next/navigation";
import { getPrograms, getProgramBySlug } from "@/lib/content";
import { ProgramApplyPageClient } from "@/components/programs/ProgramApplyPageClient";
import { mapBackendProgramToFrontend } from "@/lib/programMapper";
import { API_BASE_URL } from "@/lib/api";
import type { Metadata } from "next";
import { Program } from "@/types/program";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProgramApplyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchProgramFromBackend(slug: string): Promise<Program | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/programs/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.data) {
      const rawProg = json.data.program || json.data;
      return mapBackendProgramToFrontend(rawProg, getPrograms());
    }
  } catch (e) {
    console.error("Fetch apply program error:", e);
  }
  return null;
}

export async function generateMetadata({
  params,
}: ProgramApplyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  let program: Program | null | undefined = getProgramBySlug(decodedSlug);

  if (!program) {
    program = await fetchProgramFromBackend(decodedSlug);
  }

  if (!program) {
    return {
      title: "التسجيل | Zein Hub",
    };
  }

  return {
    title: `التسجيل في ${program.title} | Zein Hub`,
    description: `طلب الالتحاق ببرنامج ${program.title} في منصة Zein Hub للتدريب الإعلامي.`,
  };
}

export default async function ProgramApplyPage({
  params,
}: ProgramApplyPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  let program: Program | null | undefined = getProgramBySlug(decodedSlug);

  if (!program) {
    program = await fetchProgramFromBackend(decodedSlug);
  }

  if (!program) {
    notFound();
  }

  return <ProgramApplyPageClient program={program} />;
}
