# Zein Hub Media LMS — Backend API

منصة التعليم والتدريب الرقمي المتخصصة في الإعلام والإنتاج الصوتي والتقنيات الرقمية (**Zein Hub Media LMS**).

---

## 🌟 الميزات الرئيسية (Features)
- **المسارات والبرامج التدريبية:** إدارة 3 مسارات رئيسية و12+ برنامجاً تدريبياً مع البحث، الفلترة، وترقيم الصفحات.
- **إدارة المحاضرين:** تخصيص المسارات والبرامج للمحاضرين مع لوحة تحكم خاصة بكل محاضر.
- **طلبات الالتحاق والاشتراكات:** تقديم الطلاب للبرامج المفتوحة ومراجعة الإدارة مع تسجيل فوري للتقدم.
- **المناهج والدروس التفاعلية:** وحدات ودروس مرئية ومسموعة مع حماية الوسائط المدفوعة وإتاحة المعاينة المجانية.
- **الاختبارات والتقييمات:** تصحيح آلي فوري، بنك أسئلة، وتشفير الإجابات الصحيحة لمنع الغش.
- **التكليفات العملية:** تسليم ملفات الصوت والفيديو وتصحيح المحاضر ورصد الدرجات والملاحظات.
- **التقدم الأكاديمي والشهادات:** احتساب نسب الإنجاز تلقائياً وإصدار شهادات معتمدة بأرقام فريدة مع التحقق العام.
- **الجلسات المباشرة والحضور:** جدولة لقاءات (Zoom / Google Meet / Teams) وإدارة حضور وغياب الطلاب.
- **المراجعات والتقييمات:** تقييم الطلاب بنظام النجوم وطابور تدقيق الإدارة وعرض التقييمات المعتمدة.
- **لوحة التحكم والتحليلات:** مؤشرات أداء إجمالية KPIs، تقارير أداء البرامج، وتوزيع شرائح التقدم عبر MongoDB Aggregations.
- **الأمان والتحصين:** مصادقة كاملة عبر `httpOnly Secure Cookies`، محدد معدل الطلبات (Rate Limiting)، تعقيم ضد NoSQL Injection و XSS، ترويسات أمان، وضغط الاستجابات (Compression).

---

## 🛠️ البنية التقنية (Tech Stack)
- **Node.js** (v20+) & **Express.js** (v5)
- **TypeScript** (Strict Mode)
- **MongoDB** & **Mongoose** (v9)
- **Authentication:** JWT with `httpOnly Cookies` (`zh_access_token`, `zh_refresh_token`)
- **Validation:** Joi Schema Validation
- **Security:** Helmet, Express Rate Limit, Input Sanitization
- **Performance:** Compression, Compound Indexing

---

## 🚀 التثبيت والتشغيل (Installation & Setup)

### 1. تثبيت الحزم (Install Dependencies)
```bash
npm install
```

### 2. إعداد متغيرات البيئة (Environment Setup)
قم بنسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

### 3. بذر البيانات الأساسية (Database Seeding)
```bash
# إنشاء حساب الـ Super Admin
npm run seed:admin

# بذر المسارات والبرامج التدريبية الأولية
npm run seed:tracks-programs
```

### 4. تشغيل الخادم في بيئة التطوير (Development)
```bash
npm run dev
```

### 5. بناء وتشغيل بيئة الإنتاج (Production Build & Run)
```bash
npm run build
npm start
```

---

## 🧪 الاختبارات الآلية (Testing Suites)

لتشغيل اختبارات المراحل المختلفة والتأكد من سلامة النظام:
```bash
# اختبار منظومة الـ httpOnly Cookies
npx tsx scripts/testCookiesAuth.ts

# اختبار التحصين الأمني الشامل
npx tsx scripts/testPhase13.ts

# اختبار التحليلات ولوحة التحكم والـ Cross-Validation
npx tsx scripts/testPhase12.ts

# اختبار المراجعات والتقييمات
npx tsx scripts/testPhase11.ts

# اختبار الجلسات المباشرة والحضور
npx tsx scripts/testPhase10.ts

# اختبار التقدم والشهادات الرقمية
npx tsx scripts/testPhase09.ts

# اختبار الاختبارات والتكليفات العملية
npx tsx scripts/testPhase08.ts

# اختبار الدخان الشامل النهائي
npx tsx scripts/finalSmokeTest.ts
```

---

## 📁 الوثائق والمراجع (Documentation & Swagger)
- **واجهة توثيق Swagger التفاعلية:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **مخطط OpenAPI 3.0 JSON:** [http://localhost:5000/api/docs.json](http://localhost:5000/api/docs.json)
- **دليل الـ API الشامل:** [`docs/API_DOCUMENTATION.md`](file:///d:/Zein%20Hub%20Backend/docs/API_DOCUMENTATION.md)
- **جدول كافة المسارات:** [`docs/ROUTES_REFERENCE.md`](file:///d:/Zein%20Hub%20Backend/docs/ROUTES_REFERENCE.md)
- **تقرير التسليم النهائي:** [`docs/FINAL_DELIVERY_REPORT.md`](file:///d:/Zein%20Hub%20Backend/docs/FINAL_DELIVERY_REPORT.md)
- **مجموعة Postman المجمعة:** [`postman/Zein_Hub_API.postman_collection.json`](file:///d:/Zein%20Hub%20Backend/postman/Zein_Hub_API.postman_collection.json)
