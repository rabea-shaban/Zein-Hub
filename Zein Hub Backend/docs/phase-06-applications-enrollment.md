# Zein Hub Backend — Phase 06: Student Applications & Enrollment Management

توثيق شامل لنظام طلبات التحاق الطلاب بالبرامج المفتوحة ومراجعتها من قِبل الـ Super Admin، والتحويل التلقائي للطلبات المقبولة إلى اشتراكات فعلية (Enrollments) مع تهيئة سجلات تتبع التقدم (Progress).

---

## 1. قواعد العمل والـ Business Rules

1. **التقديم للطلاب فقط (`role: student`)**:
   - التقديم عبر `POST /api/v1/applications` متاح حصرياً للطلاب المسجلين.
   - يتم تحديد هوية الطالب تلقائياً من `req.user.id` وتجاهل أي قيمة مرسلة في الـ body.
2. **البرامج المفتوحة حصراً (`status: open`)**:
   - لا يُقبل أي طلب التحاق لبرامج بحالة `coming-soon` أو `closed`؛ يتم إرجاع `400 Bad Request`.
3. **منع التكرار (Single Application Rule)**:
   - منع تقديم الطالب أكثر من مرة على نفس البرنامج عبر الـ Compound Unique Index `{ studentId: 1, programId: 1 }` مع إرجاع `409 Conflict`.
4. **المراجعة والقبول التلقائي**:
   - عند قبول الطلب (`status = accepted`):
     - إنشاء سجل [`Enrollment`](../src/models/enrollment.model.ts) بحالة `active`.
     - إنشاء سجل [`Progress`](../src/models/progress.model.ts) بنسبة إنجاز مبدئية `0%`.
   - عند رفض الطلب (`status = rejected`):
     - تحديث حالة الطلب مع حفظ ملاحظات الرفض، وعدم إنشاء أي اشتراك.

---

## 2. جدول الـ Endpoints

### مسارات طلبات التقديم (Applications)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/applications` | `POST` | Student | تقديم طلب التحاق ببرنامج مفتوح |
| `/api/v1/applications/me` | `GET` | Student | استرجاع كافة طلبات الطالب الحالي |
| `/api/v1/applications/me/:id` | `GET` | Student | استرجاع تفاصيل طلب محدد للطالب الحالي |
| `/api/v1/applications` | `GET` | Super Admin | استعراض وتصفية كافة الطلبات (حسب البرنامج، الطالب، الحالة) |
| `/api/v1/applications/:id` | `GET` | Super Admin | استعراض تفاصيل الطلب الكاملة للمراجعة |
| `/api/v1/applications/:id/review` | `PATCH` | Super Admin | قبول أو رفض الطلب مع إنشاء الـ Enrollment عند القبول |

### مسارات الاشتراكات (Enrollments)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/enrollments/me` | `GET` | Student | استرجاع الكورسات المشترك بها الطالب حالياً مع التقدم |
| `/api/v1/enrollments/me/:programId` | `GET` | Student | فحص صلاحية واشتراك الطالب في برنامج محدد |
| `/api/v1/enrollments/admin/all` | `GET` | Super Admin | استعراض وإدارة كافة الاشتراكات على مستوى المنصة |
| `/api/v1/enrollments/:id/status` | `PATCH` | Super Admin | تعديل حالة الاشتراك (`active`, `completed`, `dropped`) والدرجة |
