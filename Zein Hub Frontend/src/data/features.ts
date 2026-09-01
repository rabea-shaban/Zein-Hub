import {
  FeatureItem,
  ValueItem,
  PhilosophyPillar,
  TrainingStage,
  StatMetric,
} from "@/types/site";

export const WHY_ZEIN_HUB_ITEMS: FeatureItem[] = [
  {
    id: "why-1",
    title: "بيئة استوديو وتدريب تطبيقي",
    titleEn: "Studio Simulation & Hands-On Production",
    description:
      "تجربة عملية تحاكي غرف الأخبار والاستوديوهات الحقيقية من خلال معدات تصوير، صوت، إضاءة، وبرامج مونتاج احترافية.",
    descriptionEn:
      "A real-world newsroom and broadcast studio environment equipped with 4K cameras, multi-point lighting grids, and pro NLE suites.",
    iconName: "Video",
  },
  {
    id: "why-2",
    title: "نخبة من كبار الإعلاميين",
    titleEn: "Mentorship by Industry Titans",
    description:
      "يتولى التدريب والتوجيه نخبة من الممارسين والخبراء ذوي الباع الطويل في كبرى القنوات والمنصات الصحفية والإعلامية.",
    descriptionEn:
      "Direct coaching by seasoned journalists and news anchors with decades of experience in premier Arab and international networks.",
    iconName: "Users",
  },
  {
    id: "why-3",
    title: "بناء ملف أعمال حقيقي (Portfolio)",
    titleEn: "Publishable Capstone Portfolio",
    description:
      "لا يقتصر التدريب على الشهادة فقط، بل يخرج كل متدرب بمشاريع وقصص إعلامية منجزة بمعايير البث وقابلة للنشر.",
    descriptionEn:
      "Graduates do not just hold a certificate; they produce verified, broadcast-grade video packages and podcasts ready for employer review.",
    iconName: "Film",
  },
  {
    id: "why-4",
    title: "مواكبة الإعلام الرقمي المعاصر",
    titleEn: "Modern Digital Media Integration",
    description:
      "تركيز متقدم على صحافة الموبايل (MoJo)، البودكاست الصوتي، منصات البث الرقمي، وأدوات السرد البصري الحديثة.",
    descriptionEn:
      "Deep focus on mobile journalism (MoJo), audio podcasting, multiplatform distribution, and AI-assisted data journalism.",
    iconName: "Zap",
  },
  {
    id: "why-5",
    title: "فهم عميق لخصوصية الصعيد",
    titleEn: "Deep Upper Egypt Cultural Context",
    description:
      "برامج تراعي واقع ومحافظات الصعيد، وتمكّن الشباب من توثيق قصصهم المحلية وتراثهم الإنساني بصورة حضارية عالمية.",
    descriptionEn:
      "Curricula attuned to Upper Egypt's governorates, empowering youth to document their cultural heritage and human stories authentically.",
    iconName: "MapPin",
  },
  {
    id: "why-6",
    title: "إرشاد مهني وتوجيه مستمر",
    titleEn: "1-on-1 Career Mentorship",
    description:
      "متابعة دقيقة وتقييم دوري لكل متدرب لتطوير نقاط القوة وعلاج نقاط الضعف وصقل الهوية الإعلامية الخاصة به.",
    descriptionEn:
      "Continuous individual feedback refining vocal presence, camera technique, and personal editorial branding.",
    iconName: "Award",
  },
];

export const CORE_VALUES_ITEMS: ValueItem[] = [
  {
    id: "val-1",
    title: "النزاهة والأمانة التحريرية",
    titleEn: "Journalistic Integrity & Verification",
    description:
      "نغرس في متدربينا الالتزام الصارم بمواثيق الشرف الصحفي، وتدقيق الحقائق، وفصل الخبر عن الرأي، واحترام خصوصية المصادر.",
    descriptionEn:
      "Instilling unyielding commitment to fact-checking, source confidentiality, and separation of verified facts from opinion.",
    iconName: "ShieldCheck",
  },
  {
    id: "val-2",
    title: "التطبيق العملي بنسبة 80%",
    titleEn: "80% Hands-On Studio Practice",
    description:
      "نؤمن بأن الإعلام مهنة تُكتسب بالممارسة المباشرة أمام الكاميرا، وداخل كبائن الصوت، وخلف شاشات المونتاج.",
    descriptionEn:
      "Believing that true media competence is forged through direct hands-on time before cameras, behind mics, and across NLE suites.",
    iconName: "Video",
  },
  {
    id: "val-3",
    title: "تمكين المواهب الشابة بالصعيد",
    titleEn: "Regional Youth Empowerment",
    description:
      "هدفنا خلق جيل إعلامي قادر على المنافسة في كبرى المنصات الإقليمية دون التخلي عن هويته وقضايا مجتمعه الأصيلة.",
    descriptionEn:
      "Championing emerging Southern talents to compete at national and international levels while honoring their cultural identity.",
    iconName: "Users",
  },
  {
    id: "val-4",
    title: "مواكبة الابتكار الرقمي",
    titleEn: "Digital Innovation & OSINT",
    description:
      "دمج تقنيات صحافة الموبايل، والذكاء الاصطناعي التحريري، وأدوات الـ OSINT في كافة مساراتنا التدريبية.",
    descriptionEn:
      "Integrating cutting-edge mobile cinematography, AI editorial workflows, and open-source visual forensics.",
    iconName: "Zap",
  },
];

export const PHILOSOPHY_PILLARS: PhilosophyPillar[] = [
  {
    id: "phil-1",
    num: "80/20",
    label: "معادلة التدريب العملي",
    labelEn: "The 80/20 Formula",
    title: "80% ممارسة وتطبيق • 20% أطر ومفاهيم",
    titleEn: "80% Studio & Field Production • 20% Core Theory",
    description:
      "نستبدل المحاضرات النظرية الطويلة بورش عمل تفاعلية فورية. المتدرب يبدأ في استخدام الكاميرا والميكروفون والمونتاج من اليوم الأول.",
    descriptionEn:
      "Replacing lengthy passive lectures with active studio sessions. Trainees operate pro cameras and editing suites from day one.",
  },
  {
    id: "phil-2",
    num: "PRO",
    label: "المعايير القياسية",
    labelEn: "Industry Standards",
    title: "محاكاة غرف الأخبار والاستوديوهات الحقيقية",
    titleEn: "Live Newsroom & Studio Simulation",
    description:
      "التدريب يتم بنفس الآليات والبرمجيات والمعدات المعتمدة في كبرى القنوات الفضائية والمنصات الرقمية لضمان عدم وجود فجوة عند التوظيف.",
    descriptionEn:
      "Workshops mimic broadcast control room rhythms and multicam workflows to eliminate any transition gap into the workforce.",
  },
  {
    id: "phil-3",
    num: "PORT",
    label: "الملف المهني",
    labelEn: "Deliverable Portfolio",
    title: "الشهادة تُمنح للمشروع المنجز وليس لمجرد الحضور",
    titleEn: "Credentials Granted for Tangible Output, Not Just Attendance",
    description:
      "يتخرج المتدرب ومعه عمل إعلامي متكامل (فيديو وثائقي، تحقيق مدعوم بالأدلة، حلقة بودكاست، أو Showreel تلفزيوني) يعرضه لأرباب العمل.",
    descriptionEn:
      "Every graduate leaves with a publishable capstone piece—a verified documentary, anchor showreel, or podcast pilot ready for employers.",
  },
  {
    id: "phil-4",
    num: "1-ON-1",
    label: "المتابعة الفردية",
    labelEn: "Individual Mentorship",
    title: "جلسات إرشاد وتوجيه فردية (Mentorship)",
    titleEn: "One-on-One Master Coaching & Feedback",
    description:
      "يحصل كل متدرب على ملاحظات تفصيلية ومستمرة على أدائه ولغة جسده وصوته ونصوصه لتطوير بصمته وهويته الخاصة.",
    descriptionEn:
      "Direct personalized feedback on body language, vocal resonance, and script tightness to build a distinct on-air persona.",
  },
];

export const TRAINING_STAGES: TrainingStage[] = [
  {
    step: "01",
    iconName: "FileText",
    title: "التأسيس التحريري وبناء الفكرة",
    titleEn: "Editorial Foundation & Story Conception",
    description:
      "صياغة زوايا المعالجة الصحفية، كتابة السيناريو البصري والصوتي، والتحقق الصارم من المعلومات والمصادر الميدانية.",
    descriptionEn:
      "Framing news angles, visual scriptwriting, and rigorous verification of field evidence and sources.",
    tag: "المنهجية والأخلاقيات",
    tagEn: "Methodology & Ethics",
  },
  {
    step: "02",
    iconName: "Video",
    title: "الاستوديو والمحاكاة الميدانية",
    titleEn: "Studio Production & Field Simulation",
    description:
      "تدريب عملي مكثف على الكاميرات، الإضاءة، هندسة الصوت، الإلقاء أمام العدسة، والتعامل مع ضغط التغطيات الحية.",
    descriptionEn:
      "Hands-on camera operation, 3-point lighting, studio audio, teleprompter control, and live broadcast pressure.",
    tag: "التطبيق العملي",
    tagEn: "Hands-On Practice",
  },
  {
    step: "03",
    iconName: "Layers",
    title: "المونتاج وإنتاج مشروع التخرج",
    titleEn: "Post-Production & Capstone Assembly",
    description:
      "تنفيذ فيلم وثائقي قصير، تقرير تلفزيوني، أو حلقة بودكاست متكاملة بإشراف مباشر من المدرب وتطبيق برامج المونتاج الحديثة.",
    descriptionEn:
      "Editing, sound mixing, and color grading of your capstone documentary, news package, or podcast pilot under mentor supervision.",
    tag: "صناعة القصة الفعلية",
    tagEn: "Story Crafting",
  },
  {
    step: "04",
    iconName: "Award",
    title: "التقييم المهني والاعتماد",
    titleEn: "Master Defense & Credential Signoff",
    description:
      "عرض المشروع على لجنة من كبار الإعلاميين للحصول على تقييم تفصيلي، شهادة اجتياز معتمدة، وإرشادات الانطلاق لسوق العمل.",
    descriptionEn:
      "Defending your capstone project before an independent master jury, receiving your accredited certificate and career roadmap.",
    tag: "الجاهزية والشهادة",
    tagEn: "Readiness & Credentials",
  },
];

export const IMPACT_STATS: StatMetric[] = [
  {
    id: "stat-1",
    iconName: "Users",
    value: "+500",
    label: "متدرب وصانع محتوى",
    labelEn: "Trainees & Storytellers",
    detail: "تأهيل شباب وشابات محافظات الصعيد",
    detailEn: "Empowering emerging creators in Upper Egypt",
  },
  {
    id: "stat-2",
    iconName: "Clock",
    value: "+1,200",
    label: "ساعة تدريب عملي وإنتاج",
    labelEn: "Hands-On Studio Hours",
    detail: "داخل الاستوديوهات وميدانيًا",
    detailEn: "In-studio and live fieldwork production",
  },
  {
    id: "stat-3",
    iconName: "MapPin",
    value: "+8",
    label: "محافظات ومراكز بالصعيد",
    labelEn: "Upper Egypt Governorates",
    detail: "نطاق التغطية والبرامج المستهدفة",
    detailEn: "Regional coverage and partner hubs",
  },
  {
    id: "stat-4",
    iconName: "Award",
    value: "+15",
    label: "خبير ومدرب إعلامي",
    labelEn: "Master Faculty & Anchors",
    detail: "من كبرى الشبكات والمؤسسات",
    detailEn: "From leading Arab & international networks",
  },
];
