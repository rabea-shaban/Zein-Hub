import { Instructor } from "@/types/instructor";

export const SAMPLE_INSTRUCTORS: Instructor[] = [
  {
    id: "inst-1",
    name: "م. عبد الرحمن سلطان",
    nameEn: "Eng. Abdelrahman Sultan",
    title: "خبير التعليق الصوتي ومدرب الفوكاليز المعتمد",
    titleEn: "Certified Voice-Over Master & Vocalise Coach",
    bio: "صاحب خبرة حقيقية اكتسبها من قلب السوق المصري والخليجي لأكثر من 9 سنوات. احترف العمل كمعلق صوتي مستقل (Freelancer) والتعامل مع كافة قوالب النصوص الإعلانية والوثائقية، ومعتمد رسميًا من منصة سونديلز (Soundeals).",
    bioEn: "Seasoned Voice-Over artist and master coach with over 9 years of hands-on experience in the Egyptian and Gulf markets. Renowned freelancer mastering all script genres and officially certified by Soundeals.",
    avatar: "/images/instructors/abdelrahman-sultan.jpg",
    specialization: ["التعليق الصوتي (Voice-Over)", "الفوكاليز وهندسة الصوت", "العمل الحر (Freelancing)"],
    specializationEn: ["Voice-Over & Dubbing", "Vocalise & Audio Engineering", "Media Freelancing"],
    experienceYears: 9,
    featured: true,
    roleType: "مدرب رئيسي",
    roleTypeEn: "Lead Master Instructor",
    formerAffiliations: ["منصة سونديلز (Soundeals)", "استوديوهات إنتاج مصرية وخليجية", "معلق صوتي مستقل"],
    formerAffiliationsEn: ["Soundeals Platform", "Egyptian & Gulf Production Studios", "Independent Voice Talent"],
    philosophyQuote: "اتعلم من واحد عاش التجربة، مش بس بيشرحها... من أول كلمة صوتك يبقى علامة.",
    philosophyQuoteEn: "Learn from someone who lived the craft, not just theorized it. From your first word, let your voice leave a mark.",
    coursesTaught: ["التعليق الصوتي والفوكاليز الرقمي"],
    coursesTaughtEn: ["Voice-Over & Digital Vocalise"],
    achievements: [
      "معتمد رسميًا من منصة سونديلز (Soundeals) كمعلق صوتي محترف",
      "أكثر من 9 سنوات خبرة عملية في تنفيذ مشاريع وإعلانات كبرى العلامات التجارية بمصر والخليج",
      "احتراف التعامل مع كافة أنواع النصوص: الإعلانية، الوثائقية، التجارية، والدوبلاج",
      "10 مقاعد تدريبية فقط لضمان التركيز والتطبيق الفردي المكثف لكل متدرب",
    ],
    achievementsEn: [
      "Officially Certified Voice-Over Talent on Soundeals platform",
      "9+ years of hands-on commercial & documentary production across Egypt and the GCC",
      "Mastery of commercial, corporate, documentary, and creative dubbing reads",
      "Strictly limited cohort of 10 seats for high-touch, individualized studio coaching",
    ],
    socialLinks: {
      linkedin: "https://linkedin.com",
    },
  },
];
