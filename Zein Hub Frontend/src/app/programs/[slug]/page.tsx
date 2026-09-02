import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { getPrograms, getProgramBySlug, getInstructorById } from "@/lib/content";
import { ProgramDetailClient } from "@/components/programs/ProgramDetailClient";
import { mapBackendProgramToFrontend } from "@/lib/programMapper";
import { API_BASE_URL } from "@/lib/api";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProgramDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function fetchProgramFromBackend(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/programs/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.data) {
      const rawProg = json.data.program || json.data;
      const mapped = mapBackendProgramToFrontend(rawProg, getPrograms());
      const instructorData =
        (json.data.instructors && json.data.instructors[0]) ||
        rawProg.instructorId ||
        null;
      return { program: mapped, instructorData };
    }
  } catch (e) {
    console.error("Fetch program error:", e);
  }
  return null;
}

export async function generateMetadata({
  params,
}: ProgramDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const backendRes = await fetchProgramFromBackend(decodedSlug);
  const program = backendRes?.program || getProgramBySlug(decodedSlug);

  if (!program) {
    return {
      title: "البرنامج التدريبي غير موجود",
    };
  }

  return {
    title: `${program.title} | Zein Hub`,
    description: program.subtitle,
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let program: any = null;
  let backendInstructorData: any = null;

  const backendRes = await fetchProgramFromBackend(decodedSlug);
  if (backendRes) {
    program = backendRes.program;
    backendInstructorData = backendRes.instructorData;
  } else {
    program = getProgramBySlug(decodedSlug);
  }

  if (!program) {
    notFound();
  }

  let instructor = getInstructorById(program.instructorId);

  if (!instructor && backendInstructorData) {
    const rawUser = backendInstructorData.user || backendInstructorData;
    const nameAr = rawUser.fullName || backendInstructorData.fullName || "محاضر واستشاري معتمد";
    const nameEn = rawUser.fullNameEn || backendInstructorData.fullNameEn || "Certified Media Coach";

    instructor = {
      id: rawUser._id || backendInstructorData._id || "inst-dynamic",
      name: nameAr,
      nameEn: nameEn,
      title: "محاضر وخبير إعلامي معتمد",
      titleEn: "Senior Certified Media Coach",
      bio: backendInstructorData.bio || "مدرب واستشاري إعلامي وصوتي معتمد لدى استوديوهات Zein Hub بصعيد مصر.",
      bioEn: backendInstructorData.bioEn || "Certified Media & Vocal Coach at Zein Hub Studios Upper Egypt.",
      avatar: rawUser.avatarUrl || backendInstructorData.photoUrl || "/images/instructors/instructor-1.svg",
      specialization: backendInstructorData.specializations || ["الفوكاليز الرقمي", "التعليق الصوتي"],
      specializationEn: backendInstructorData.specializationsEn || ["Digital Vocalise", "Voice-Over"],
      experienceYears: backendInstructorData.experienceYears || 12,
      featured: true,
    };
  }

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen transition-colors duration-300">
      <Container>
        <ProgramDetailClient program={program} instructor={instructor} />
      </Container>
    </div>
  );
}
