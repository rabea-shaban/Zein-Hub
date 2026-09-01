# Zein Hub Backend — Phase 04: Tracks & Programs Management

توثيق شامل لنظام إدارة المجالات والبرامج التدريبية لمنصة **Zein Hub Media LMS**.

---

## 1. المجالات والبرامج الأساسية (Tracks & Real Programs)

تم تهيئة قاعدة البيانات بالـ 3 مجالات والـ 12 برنامجًا الحقيقيين:

### المجال 1: الصوت والإعلام (`audio-media`)
1. **التعليق الصوتي والفوكاليز الرقمي (`voice-over-digital-vocalise`)**: `OPEN` 🟢, `isFeatured: true`
2. **التقديم والإلقاء الإخباري (`news-anchoring-media-presentation`)**: `COMING_SOON` 🟡
3. **السلامة اللغوية للإعلاميين (`media-grammar-language-precision`)**: `COMING_SOON` 🟡
4. **صناعة البودكاست الذكي (`smart-podcasting-audio-production`)**: `COMING_SOON` 🟡

### المجال 2: التكنولوجيا والذكاء الاصطناعي (`tech-ai-solutions`)
5. **تطبيقات الواقع الافتراضي في الإعلام (`vr-applications-media`)**: `COMING_SOON` 🟡
6. **كشف التزييف العميق والتحقق من المحتوى (`deepfake-verification-fact-checking`)**: `COMING_SOON` 🟡
7. **هندسة الأوامر لصناع المحتوى (`prompt-engineering-content-creators`)**: `COMING_SOON` 🟡
8. **المونتاج وتحرير الفيديو الآلي (`automated-video-editing-post-production`)**: `COMING_SOON` 🟡

### المجال 3: النمو الاستراتيجي والعلاقات العامة (`strategic-growth-pr`)
9. **أتمتة التسويق الرقمي (`marketing-automation`)**: `COMING_SOON` 🟡
10. **العلاقات العامة الرقمية (`digital-public-relations`)**: `COMING_SOON` 🟡
11. **إدارة السمعة والأنشطة الرقمية (`reputation-management-brand-protection`)**: `COMING_SOON` 🟡
12. **استخدام الهندسة الصوتية وأخلاقيات الاستنساخ الصوتي (`ethical-voice-cloning-audio-engineering`)**: `COMING_SOON` 🟡

---

## 2. جدول الـ Endpoints والعمليات

### مسارات المجالات (Tracks)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/tracks` | `GET` | Public | قائمة المجالات مع إحصائيات عدد البرامج التابعة لكل مجال |
| `/api/v1/tracks/:idOrSlug` | `GET` | Public | تفاصيل المجال مع كافة البرامج التابعة له |
| `/api/v1/tracks` | `POST` | Super Admin | إنشاء مجال جديد |
| `/api/v1/tracks/:id` | `PATCH` | Super Admin | تعديل بيانات المجال |
| `/api/v1/tracks/:id` | `DELETE` | Super Admin | حذف أو تعطيل المجال |

### مسارات البرامج (Programs)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/programs` | `GET` | Public | تصفح البرامج مع الفلترة والبحث والترقيم (Pagination) |
| `/api/v1/programs/featured` | `GET` | Public | استرجاع البرامج المميزة (Featured Spotlight) |
| `/api/v1/programs/:idOrSlug` | `GET` | Public | تفاصيل البرنامج مع بيانات المجال والمحاضرين المسندين |
| `/api/v1/programs` | `POST` | Super Admin | إنشاء برنامج جديد وربطه بالمسار |
| `/api/v1/programs/:id` | `PATCH` | Super Admin | تعديل تفاصيل البرنامج |
| `/api/v1/programs/:id/status` | `PATCH` | Super Admin | تغيير حالة البرنامج (`open`, `coming-soon`, `closed`) |
| `/api/v1/programs/:id/featured` | `PATCH` | Super Admin | تبديل حالة التمييز للبرنامج (Toggle Featured) |
| `/api/v1/programs/:id/assign-instructor` | `POST` | Super Admin | إسناد محاضر للبرنامج مع التحقق من الرتبة والبروفايل |
| `/api/v1/programs/:id/unassign-instructor` | `POST` | Super Admin | إلغاء إسناد المحاضر من البرنامج |
| `/api/v1/programs/:id` | `DELETE` | Super Admin | تعطيل البرنامج |
