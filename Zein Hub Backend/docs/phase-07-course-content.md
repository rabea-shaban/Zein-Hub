# Zein Hub Backend — Phase 07: Course Content Management (Modules & Lessons)

توثيق شامل لنظام إدارة المحتوى التعليمي والتدريبي (الوحدات `Modules` والدروس والوسائط `Lessons`) مع حماية المحتوى المدفوع والدروس المجانية وصلاحيات المحاضرين لمنصة **Zein Hub Media LMS**.

---

## 1. قواعد العمل والـ Business Logic

1. **صلاحيات إنشاء وتعديل المحتوى**:
   - **Super Admin**: إدارة المحتوى لأي برنامج تدريبي على مستوى المنصة.
   - **Instructor**: إدارة المحتوى حصرياً للبرامج المسندة له في `InstructorProfile.assignedPrograms`.
   - **Student**: ممنوع من إنشاء أو تعديل أو حذف الوحدات والدروس (`403 Forbidden`).
2. **سياسة الوصول وحماية المحتوى (Context-Aware Access Policy)**:
   - **الدروس المجانية (`isFreePreview: true`)**:
     - متاحة بالكامل للزوار والطلاب غير المشتركين والمشتركين.
   - **الدروس المدفوعة (`isFreePreview: false`)**:
     - متاحة حصرياً لـ:
       1. الـ Super Admin
       2. المحاضر المسند للبرنامج
       3. الطالب الذي يمتلك اشتراكاً نشطاً أو مكتملاً (`Enrollment.status: 'active' | 'completed'`)
     - الزائر أو الطالب غير المشترك يُمنع من الوصول للدرس بـ `403 Forbidden` (`Active enrollment required to access this lesson`).
3. **حجب المحتوى المدفوع في مسارات الكتالوج (Listing Sanitization - Rule #20)**:
   - عند طلب منهج البرنامج (`GET /programs/:programId/modules`) أو دروس الوحدة (`GET /course-modules/:moduleId/lessons`) من قِبل زائر أو طالب غير مشترك:
     - تظهر تفاصيل الدرس العادية (العنوان، المدة، نوع المحتوى، الترتيب، `isLocked: true`).
     - يتم حجب روابط الفيديو والصوت والنصوص والمرفقات (`contentUrl: null`, `textBody: null`, `resources: []`) لمنع تسريب المحتوى المدفوع نهائياً.

---

## 2. جدول الـ Endpoints

### مسارات الوحدات التدريبية (Course Modules)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/programs/:programId/modules` | `GET` | Context-Aware | استعراض منهج البرنامج والوحدات والدروس مع حجب المدفوع |
| `/api/v1/programs/:programId/modules` | `POST` | Admin / Assigned Instructor | إنشاء وحدة تدريبية جديدة داخل البرنامج |
| `/api/v1/course-modules/:id` | `GET` | Context-Aware | تفاصيل الوحدة والدروس التابعة لها |
| `/api/v1/course-modules/:id` | `PATCH` | Admin / Assigned Instructor | تعديل بيانات الوحدة |
| `/api/v1/course-modules/:id/reorder` | `PATCH` | Admin / Assigned Instructor | تعديل ترتيب الوحدة داخل البرنامج |
| `/api/v1/course-modules/:id` | `DELETE` | Admin / Assigned Instructor | حذف الوحدة والدروس التابعة لها (Cascade Delete) |

### مسارات الدروس والمحتوى (Lessons)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/course-modules/:moduleId/lessons` | `GET` | Context-Aware | استعراض دروس الوحدة مع حجب المحتوى للمستخدمين غير المصرح لهم |
| `/api/v1/course-modules/:moduleId/lessons` | `POST` | Admin / Assigned Instructor | إنشاء درس جديد داخل الوحدة |
| `/api/v1/lessons/:id` | `GET` | Context-Aware | تفاصيل ومحتوى الدرس (فحص Free Preview مقابل الاشتراك) |
| `/api/v1/lessons/:id` | `PATCH` | Admin / Assigned Instructor | تعديل بيانات ومحتوى الدرس |
| `/api/v1/lessons/:id/publish` | `PATCH` | Admin / Assigned Instructor | نشر أو إلغاء نشر الدرس |
| `/api/v1/lessons/:id/reorder` | `PATCH` | Admin / Assigned Instructor | تعديل ترتيب الدرس داخل الوحدة |
| `/api/v1/lessons/:id` | `DELETE` | Admin / Assigned Instructor | حذف الدرس |
