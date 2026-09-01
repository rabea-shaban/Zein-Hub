# Zein Hub Backend — Phase 08: Quizzes & Practical Assignments (Audio/Video Submissions & Grading)

توثيق شامل لنظام التقييمات والاختبارات القصيرة (`Quizzes`) وبنوك الأسئلة (`Questions`)، ونظام التكليفات العملية (`Assignments`)، والتسليمات الصوتية والمرئية، والتصحيح ورصد الدرجات من قِبل المحاضر المسند حصرياً لمنصة **Zein Hub Media LMS**.

---

## 1. قواعد العمل والـ Business Logic

1. **إدارة الاختبارات والأسئلة (Quizzes & Question Bank)**:
   - إنشاء وإدارة الـ Quizzes والأسئلة محصورة في الـ Super Admin والمحاضر المسند للبرنامج (`assignedPrograms`).
   - حظر كشف الإجابات الصحيحة (`isCorrect`) والتفسيرات للطلاب قبل تسليم الاختبار لمنع الغش (Anti-Cheat).
   - التحقق الصارم من اشتراك الطالب النشط (`Enrollment.status: 'active' | 'completed'`) قبل بدء الاختبار أو الإرسال.
   - التصحيح الآلي الفوري وحساب النتيجة ورصد المحاولة في [`QuizAttempt`](../src/models/quizAttempt.model.ts) وتحديث سجل تقدم الطالب في [`Progress`](../src/models/progress.model.ts).
2. **التكليفات العملية (Practical Assignments - Audio/Video/File/Text)**:
   - إنشاء وإدارة التكليفات محصورة في الـ Super Admin والمحاضر المسند للبرنامج.
   - دعم تسليم الملفات الصوتية والمرئية والمستندات والنصوص.
   - إرسال التكليف متاح حصرياً للطلاب المشتركين بالبرنامج.
3. **التصحيح ورصد الدرجات (Grading Workflow)**:
   - التصحيح متاح حصرياً للمحاضر المسند للبرنامج (`assignedPrograms`) أو الـ Super Admin.
   - حظر أي محاضر غير مسند من استعراض أو تصحيح تكليفات البرنامج (`403 Forbidden`).
   - رصد الدرجة (`grade`) والملاحظات التقييمية (`feedback`) وتاريخ التصحيح والمصحح (`gradedBy`).
   - إمكانية اطلاع الطالب على نتيجته وملاحظات المحاضر فور انتهاء التصحيح.

---

## 2. جدول الـ Endpoints

### مسارات الاختبارات والأسئلة (Quizzes & Questions)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/lessons/:lessonId/quizzes` | `POST` | Admin / Assigned Instructor | إنشاء اختبار داخل الدرس |
| `/api/v1/quizzes/:id` | `GET` | Context-Aware | استعراض الاختبار والأسئلة (حجب الإجابات للطلاب) |
| `/api/v1/quizzes/:id` | `PATCH` | Admin / Assigned Instructor | تعديل إعدادات الاختبار |
| `/api/v1/quizzes/:id/questions` | `POST` | Admin / Assigned Instructor | إضافة سؤال للاختبار |
| `/api/v1/quizzes/:id/submit` | `POST` | Enrolled Student | تسليم إجابات الاختبار والتصحيح الآلي |
| `/api/v1/quizzes/questions/:id` | `PATCH` | Admin / Assigned Instructor | تعديل سؤال |
| `/api/v1/quizzes/questions/:id` | `DELETE` | Admin / Assigned Instructor | حذف سؤال |
| `/api/v1/quizzes/:id` | `DELETE` | Admin / Assigned Instructor | حذف الاختبار |

### مسارات التكليفات العملية والتصحيح (Assignments & Submissions)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/lessons/:lessonId/assignments` | `POST` | Admin / Assigned Instructor | إنشاء تكليف عملي داخل الدرس |
| `/api/v1/assignments/:id` | `GET` | Context-Aware | تفاصيل التكليف وشروط التسليم |
| `/api/v1/assignments/:id` | `PATCH` | Admin / Assigned Instructor | تعديل التكليف |
| `/api/v1/assignments/:id/submit` | `POST` | Enrolled Student | إرسال تسليم التكليف (Audio, Video, File, Text) |
| `/api/v1/assignments/:id/my-submission` | `GET` | Enrolled Student | استعراض تسليم الطالب الحالي وحالة التقييم |
| `/api/v1/assignments/:id/submissions` | `GET` | Admin / Assigned Instructor | قائمة تسليمات الطلاب للتكليف |
| `/api/v1/submissions/:id/grade` | `PATCH` | Admin / Assigned Instructor | تصحيح التسليم ورصد الدرجة والملاحظات |
| `/api/v1/assignments/:id` | `DELETE` | Admin / Assigned Instructor | حذف التكليف |
