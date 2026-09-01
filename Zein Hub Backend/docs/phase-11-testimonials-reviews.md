# Zein Hub Backend — Phase 11: Testimonials & Reviews Management

توثيق شامل لنظام تقييمات وآراء الطلاب (`Student Reviews`)، ودورة تدقيق واعتماد المراجعات (`Moderation Workflow: Pending -> Approved -> Rejected`)، وعرض التقييمات العامة وحساب متوسطات النجوم لمنصة **Zein Hub Media LMS**.

---

## 1. قواعد العمل والـ Business Logic

1. **تقييمات الطلاب (Student Reviews Submission)**:
   - الطالب المقيد بالبرنامج فقط (`Enrollment.status: 'active' | 'completed'`) يستطيع إضافة تقييم.
   - تقييم النجوم من 1 إلى 5 مع تعليق نصي لا يقل عن 5 أحرف ولا يتجاوز 2000 حرف.
   - منع التقييم المزدوج لنفس البرنامج بفضل الفهرس الفريد المركب (`studentId + programId`).
   - يدخل التقييم الجديد مباشرة في طابور المراجعة بحالة `pending`.
2. **دورة تدقيق ومراجعة الإدارة (Super Admin Moderation Workflow)**:
   - الـ Super Admin فقط هو المخول باعتماد أو رفض التقييمات.
   - حالات المراجعة: `pending` $\rightarrow$ `approved` أو `rejected` مع إمكانية إضافة ملاحظات التدقيق (`moderationNotes`) وتحديد التقييم كـ `isFeatured`.
   - أي تعديل يجريه الطالب على تقييمه يعيد الحالة تلقائياً إلى `pending` لإعادة المراجعة والتدقيق.
3. **عرض التقييمات العامة (Public Testimonials & Program Reviews)**:
   - استبعاد أي تقييم غير معتمد (`pending` أو `rejected`) من الواجهات العامة وحجب بيانات المراجعة الداخلية عن الزوار.
   - احتساب متوسط تقييم البرنامج وتوزيع النجوم (Breakdown 1 to 5 stars) تلقائياً.

---

## 2. جدول الـ Endpoints

### مسارات التقييمات والآراء (Reviews & Testimonials)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/programs/:programId/reviews` | `POST` | Enrolled Student | إرسال تقييم جديد للبرنامج (حالة: `pending`) |
| `/api/v1/programs/:programId/reviews` | `GET` | Public | استعراض التقييمات المعتمدة وحساب متوسط النجوم للبرنامج |
| `/api/v1/reviews/approved` | `GET` | Public | استعراض آراء الطلاب المعتمدة العامة مع الفلترة والصفحات |
| `/api/v1/reviews/me` | `GET` | Student | استعراض تقييمات الطالب وحالات مراجعتها |
| `/api/v1/reviews/:id` | `GET` | Context-Aware | تفاصيل التقييم (محجوبة إن لم تكن معتمدة إلا للمالك والإدارة) |
| `/api/v1/reviews/:id` | `PATCH` | Student (Owner) | تعديل التقييم (يعاد إلى `pending` تلقائياً) |
| `/api/v1/reviews/:id` | `DELETE` | Student (Owner) / Admin | حذف التقييم |
| `/api/v1/reviews/admin/all` | `GET` | Super Admin | استعراض كافة التقييمات بمختلف حالاتها |
| `/api/v1/reviews/:id/moderate` | `PATCH` | Super Admin | اعتماد أو رفض التقييم ورصد الملاحظات |
