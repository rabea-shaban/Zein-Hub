# Zein Hub Backend — Phase 09: Student Progress & Grade Tracking

توثيق شامل لنظام تتبع تقدم الطلاب، واحتساب نسب إنجاز الدروس، واحتساب المعدلات والدرجات النهائية، وقواعد إتمام الكورسات (Course Completion)، والإصدار التلقائي لشهادات التخرج الرسمية مع التحقق العام لمنصة **Zein Hub Media LMS**.

---

## 1. قواعد العمل والـ Business Logic

1. **فصل نسبة إنجاز المحتوى عن المعدل الأكاديمي**:
   - **نسبة إنجاز المحتوى (Content Progress)**:
     $$\text{completionPercentage} = \frac{\text{الدروس المكتملة}}{\text{إجمالي الدروس المنشورة}} \times 100$$
   - **المعدل الأكاديمي النهائي (Academic Final Grade)**:
     $$\text{finalGrade} = \frac{\text{متوسط درجات الاختبارات} + \text{متوسط درجات التكليفات}}{2}$$
2. **شروط إتمام البرنامج (Course Completion Rules)**:
   - اشتراك الطالب نشط (`Enrollment.status: 'active'`).
   - إتمام جميع الدروس المنشورة في البرنامج (100% Content Complete).
   - اجتياز جميع الاختبارات المقررة (`quizProgress.passed === true`).
   - تقييم ورصد درجات جميع التكليفات العملية (`Submission.status: 'graded'`).
   - المعدل النهائي الأكاديمي يحقق درجة النجاح ($\ge 70\%$).
   - عند استيفاء جميع الشروط:
     1. تحويل حالة الاشتراك إلى `completed` وتعيين `completedAt`.
     2. إصدار شهادة تخرج رسمية فريدة برقم توثيق (مثل `ZH-VOI-2026-43665E`).
     3. ربط رابط الشهادة بملف الاشتراك.
     4. ضمان عدم تكرار إصدار الشهادات عند إعادة الحساب (Idempotency).
3. **التحقق العام من الشهادات (Public Certificate Verification)**:
   - مسار عام مفتوح للجميع (`GET /api/v1/certificates/:certificateNumber/verify`) للتحقق من صحة ومصداقية الشهادة واسم الطالب والبرنامج والمعدل وتاريخ الإصدار دون كشف أي بيانات حساسة.

---

## 2. جدول الـ Endpoints

### مسارات تتبع التقدم (Student Progress)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/progress/me` | `GET` | Student | استعراض تقدم الطالب في جميع الكورسات المسجل بها |
| `/api/v1/progress/me/:programId` | `GET` | Student | تفاصيل تقدم الدروس والاختبارات والتكليفات بكورس معين |
| `/api/v1/lessons/:lessonId/complete` | `POST` | Enrolled Student | تسجيل إتمام الدرس وإعادة احتساب التقدم تلقائياً |
| `/api/v1/progress/program/:programId` | `GET` | Admin / Assigned Instructor | استعراض تقدم كافة الطلاب بالبرنامج |
| `/api/v1/progress/program/:programId/recalculate` | `POST` | Admin / Assigned Instructor | إعادة احتساب التقدم لجميع طلاب البرنامج |

### مسارات الشهادات والتوثيق (Certificates)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/certificates/me` | `GET` | Student | استعراض شهادات التخرج الصادرة للطالب |
| `/api/v1/certificates/:id` | `GET` | Context-Aware | تفاصيل شهادة معينة |
| `/api/v1/certificates/:certificateNumber/verify` | `GET` | Public | التحقق العام والمصادقة على صحة الشهادة |
