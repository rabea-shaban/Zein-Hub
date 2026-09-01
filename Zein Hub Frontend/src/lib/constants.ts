import { SiteConfig, NavLink, TargetRegion } from "@/types/site";

export const SITE_CONFIG: SiteConfig = {
  name: "Zein Hub",
  tagline: "من الصعيد.. بنصنع إعلام المستقبل",
  description:
    "Zein Hub منصة متخصصة في التدريب الإعلامي الاحترافي، من الصعيد.. بنصنع إعلام المستقبل، بنركز على تطوير المهارات العملية وربطها باحتياجات سوق الإعلام مع اهتمام خاص بمواهب وشباب صعيد مصر.",
  url: "https://zein-hub.vercel.app",
  email: "contact@zeinhub.com",
  phone: "+20 100 000 0000",
  whatsapp: "+20 100 000 0000",
  workingHours: "السبت – الخميس: 9:00 ص – 6:00 م",
  socials: {
    facebook: "https://facebook.com/zeinhub",
    instagram: "https://instagram.com/zeinhub",
    linkedin: "https://linkedin.com/company/zeinhub",
    youtube: "https://youtube.com/@zeinhub",
  },
};

export const BRAND_IDENTITY = {
  name: "Zein Hub",
  slogan: {
    ar: "من الصعيد.. بنصنع إعلام المستقبل",
    en: "From Upper Egypt, We Create the Media of Tomorrow",
  },
  sloganPrefix: {
    ar: "من الصعيد..",
    en: "From Upper Egypt,",
  },
  sloganMain: {
    ar: "بنصنع إعلام المستقبل",
    en: "We Create the Media of Tomorrow",
  },
  statement: {
    ar: "Zein Hub منصة متخصصة في التدريب الإعلامي، بنركز على تطوير المهارات العملية وربطها باحتياجات سوق الإعلام، مع اهتمام خاص بمواهب وشباب صعيد مصر.",
    en: "Zein Hub is a specialized media training platform focused on practical skills, industry needs, and developing the next generation of media talent in Upper Egypt.",
  },
  regionalAnchor: {
    ar: "البداية من الصعيد.. والطموح لإعلام المستقبل.",
    en: "Starting from Upper Egypt, building the media of tomorrow.",
  }
};

export const NAV_LINKS: NavLink[] = [
  { label: "الرئيسية", href: "/" },
  { label: "البرامج التدريبية", href: "/programs" },
  { label: "عن المنصة", href: "/about" },
  { label: "المدربون والخبراء", href: "/instructors" },
  { label: "تواصل معنا", href: "/contact" },
];

export const TARGET_REGIONS: TargetRegion[] = [
  { id: "assiut", nameAr: "أسيوط", nameEn: "Assiut" },
  { id: "sohag", nameAr: "سوهاج", nameEn: "Sohag" },
  { id: "qena", nameAr: "قنا", nameEn: "Qena" },
  { id: "luxor", nameAr: "الأقصر", nameEn: "Luxor" },
  { id: "aswan", nameAr: "أسوان", nameEn: "Aswan" },
  { id: "minya", nameAr: "المنيا", nameEn: "Minya" },
  { id: "beni-suef", nameAr: "بني سويف", nameEn: "Beni Suef" },
];
