import { Program } from "@/types/program";

export function normalizeTrackId(raw: any, matchFallback?: Program): "audio-media" | "tech-ai" | "strategic-pr" {
  const tr = raw.trackId || raw.track;
  const slug = (
    typeof tr === "object" ? tr?.slug || "" : String(tr || "")
  ).toLowerCase();

  const nameAr = (typeof tr === "object" ? tr?.nameAr || "" : "").toLowerCase();
  const nameEn = (typeof tr === "object" ? tr?.nameEn || "" : "").toLowerCase();
  const category = (raw.category || raw.categoryEn || "").toLowerCase();

  if (
    slug === "tech-ai" ||
    slug === "tech-ai-solutions" ||
    slug.includes("tech") ||
    slug.includes("ai") ||
    nameAr.includes("ذكاء") ||
    nameAr.includes("تكنولوجي") ||
    nameEn.includes("tech") ||
    nameEn.includes("ai") ||
    category.includes("ذكاء") ||
    category.includes("تكنولوجيا")
  ) {
    return "tech-ai";
  }

  if (
    slug === "strategic-pr" ||
    slug === "strategic-growth-pr" ||
    slug.includes("strategic") ||
    slug.includes("pr") ||
    slug.includes("growth") ||
    nameAr.includes("علاقات") ||
    nameAr.includes("نمو") ||
    nameEn.includes("pr") ||
    nameEn.includes("growth") ||
    category.includes("علاقات") ||
    category.includes("نمو")
  ) {
    return "strategic-pr";
  }

  return matchFallback?.trackId || "audio-media";
}

export function mapBackendProgramToFrontend(raw: any, fallbackPrograms: Program[]): Program {
  const matchFallback = fallbackPrograms.find(
    (f) =>
      f.slug === raw.slug ||
      f.id === raw._id ||
      f.id === raw.id ||
      f.title === raw.titleAr
  );

  const normalizedTrackId = normalizeTrackId(raw, matchFallback);

  const categoryAr =
    normalizedTrackId === "audio-media"
      ? "الصوت والإعلام"
      : normalizedTrackId === "tech-ai"
      ? "التكنولوجيا والذكاء الاصطناعي"
      : "النمو الاستراتيجي والعلاقات العامة";

  const categoryEn =
    normalizedTrackId === "audio-media"
      ? "Audio & Media"
      : normalizedTrackId === "tech-ai"
      ? "Tech & AI Solutions"
      : "Strategic Growth & PR";

  const defaultWeeks = Array.from({ length: Math.min(6, raw.durationWeeks || 4) }, (_, i) => ({
    weekNumber: i + 1,
    title: `المرحلة التطبيقية 0${i + 1}: التدريب العملي وبناء المهارة`,
    titleEn: `Module 0${i + 1}: Hands-on Practical Studio Training`,
    description: `تطبيقات مكثفة ومحاكاة عملية داخل استوديوهات Zein Hub تحت إشراف نخبة من المدربين.`,
    descriptionEn: `Practical hands-on studio drills and simulations under the supervision of senior coaches.`,
    topics: ["التطبيقات العملية المباشرة", "التمارين والاستوديو الميداني", "معايير الجودة والتقييم"],
    topicsEn: ["Live hands-on practice", "Studio exercises", "Industry standards & review"],
    practicalProject: `تسجيل وتطبيق مشروع المرحلة 0${i + 1}`,
    practicalProjectEn: `Record & produce module project 0${i + 1}`,
  }));

  return {
    id: raw._id || raw.id || matchFallback?.id || raw.slug,
    slug: raw.slug || matchFallback?.slug || "",
    trackId: normalizedTrackId,
    status: raw.status || matchFallback?.status || "open",
    title: raw.titleAr || raw.title || matchFallback?.title || "برنامج تدريبي",
    titleEn: raw.titleEn || raw.titleAr || matchFallback?.titleEn || "Training Program",
    subtitle: raw.descriptionAr || raw.subtitle || matchFallback?.subtitle || "",
    subtitleEn: raw.descriptionEn || raw.subtitleEn || matchFallback?.subtitleEn || "",
    description: raw.descriptionAr || raw.description || matchFallback?.description || "",
    descriptionEn: raw.descriptionEn || raw.description || matchFallback?.descriptionEn || "",
    category: categoryAr,
    categoryEn: categoryEn,
    level: raw.level || matchFallback?.level || "متوسط",
    levelEn:
      raw.level === "beginner"
        ? "Beginner"
        : raw.level === "advanced"
        ? "Advanced"
        : matchFallback?.levelEn || "Intermediate",
    format: raw.format || matchFallback?.format || "استوديو تطبيقي",
    formatEn: raw.formatEn || matchFallback?.formatEn || "In-Studio Hands-on",
    durationWeeks: raw.durationWeeks || matchFallback?.durationWeeks || 6,
    totalHours: raw.durationHours || raw.totalHours || matchFallback?.totalHours || 30,
    weeklyHours:
      Math.round((raw.durationHours || 30) / (raw.durationWeeks || 6)) ||
      matchFallback?.weeklyHours ||
      5,
    featured: Boolean(raw.isFeatured ?? matchFallback?.featured ?? false),
    image: raw.coverImageUrl || matchFallback?.image || "/images/programs/voice-over.svg",
    imageAlt: matchFallback?.imageAlt || raw.titleAr || "برنامج تدريبي",
    imageAltEn: matchFallback?.imageAltEn || raw.titleEn || "Training Program",
    instructorId:
      typeof raw.instructorId === "object"
        ? raw.instructorId?._id || "inst-1"
        : raw.instructorId || matchFallback?.instructorId || "inst-1",
    targetAudience: raw.targetAudience || matchFallback?.targetAudience || [
      "خريجو الإعلام والصحافة وصناع المحتوى",
      "الراغبون في احتراف المجال العملي بالصعيد",
    ],
    targetAudienceEn: raw.targetAudienceEn || matchFallback?.targetAudienceEn || [
      "Media & Journalism Graduates and Content Creators",
      "Talents seeking hands-on practical career readiness",
    ],
    learningOutcomes: raw.learningOutcomes || raw.learningOutcomesAr || matchFallback?.learningOutcomes || [
      "إتقان الأداء العملي والمهارات الاحترافية للتخصص",
      "إنتاج مشروع تخرج واقعي متكامل معتمد لسوق العمل",
    ],
    learningOutcomesEn: raw.learningOutcomesEn || matchFallback?.learningOutcomesEn || [
      "Master hands-on practical industry techniques",
      "Produce a certified portfolio capstone project",
    ],
    curriculum: (raw.curriculum && raw.curriculum.length > 0) ? raw.curriculum : (matchFallback?.curriculum || defaultWeeks),
    toolsAndGear: raw.toolsAndGear || matchFallback?.toolsAndGear || ["استوديوهات Zein Hub الصوتية والمرئية", "البرمجيات والأجهزة الاحترافية"],
    toolsAndGearEn: raw.toolsAndGearEn || matchFallback?.toolsAndGearEn || ["Zein Hub Media Studios", "Industry-Grade Gear & Software"],
    capstoneProject: raw.capstoneProject || matchFallback?.capstoneProject || {
      title: "مشروع التخرج المعتمد",
      titleEn: "Certified Capstone Project",
      description: "إنتاج محتوى إعلامي احترافي متكامل جاهز للعرض والبث المباشر.",
      descriptionEn: "Complete broadcast-grade portfolio capstone ready for industry clients.",
      deliverable: "ملف إعلامي وبورتفوليو رقمي معتمد",
      deliverableEn: "Certified Digital Media Portfolio & Demo Reel",
    },
    prerequisites: raw.prerequisites || matchFallback?.prerequisites || ["الشغف بالتعلم والالتزام بحضور التدريبات العملية"],
    prerequisitesEn: raw.prerequisitesEn || matchFallback?.prerequisitesEn || ["Passion for learning and commitment to studio sessions"],
  };
}
