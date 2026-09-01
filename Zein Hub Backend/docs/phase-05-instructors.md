# Zein Hub Backend — Phase 05: Instructor Management

توثيق شامل لنظام إدارة المحاضرين والصلاحيات ولوحة تحكم المحاضر (Instructor Management & Dashboard) لمنصة **Zein Hub Media LMS**.

---

## 1. القواعد والـ Business Logic للمحاضر

1. **الإنشاء الحصري عبر الـ Super Admin**:
   - لا يوجد مسار تسجيل عام للـ Instructor.
   - الـ Super Admin ينشئ حساب المستخدم (`role: instructor`) والـ `InstructorProfile` الملحق به ويحدد تخصصاته والبرامج المسندة له عبر `POST /api/v1/instructors`.
2. **صلاحيات المحاضر (Assigned Programs Scope)**:
   - المحاضر لا يملك صلاحية عامة على المنصة.
   - صلاحياته محصورة في البرامج المعينة له في `InstructorProfile.assignedPrograms`.
   - محاولة المحاضر الوصول لكورس غير مسند إليه تُرفض فوراً بـ `403 Forbidden`.
3. **لوحة تحكم المحاضر (Instructor Dashboard)**:
   - مؤشرات البرامج المسندة، إجمالي الطلاب، الطلاب النشطين، الطلاب الذين أتموا الدورات، الواجبات المعلقة بانتظار التقييم، والجلسات الحية القادمة.
4. **تعديل الملف الشخصي (Self Profile)**:
   - المحاضر يستطيع تعديل النبذة، الصورة، روابط السوشيال، والتخصصات عبر `PATCH /api/v1/instructors/me/profile`.
   - لا يمكن للمحاضر تعديل الـ `role`، الـ `email`، الـ `isActive`، أو الـ `assignedPrograms`.

---

## 2. جدول الـ Endpoints

| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/instructors` | `GET` | Public | قائمة المحاضرين النشطين في الكتالوج العام |
| `/api/v1/instructors/:id` | `GET` | Public | تفاصيل الملف الشخصي للمحاضر والبرامج المسندة له |
| `/api/v1/instructors/admin/all` | `GET` | Super Admin | قائمة المحاضرين الكاملة مع البحث والفلترة والترقيم |
| `/api/v1/instructors` | `POST` | Super Admin | إنشاء حساب محاضر جديد وملفه الشخصي |
| `/api/v1/instructors/:id` | `PATCH` | Super Admin | تعديل بيانات المحاضر وحسابه والبرامج المسندة |
| `/api/v1/instructors/:id/status` | `PATCH` | Super Admin | تفعيل أو تعطيل حساب المحاضر |
| `/api/v1/instructors/:id/assigned-programs` | `POST` | Super Admin | تحديث البرامج المسندة للمحاضر |
| `/api/v1/instructors/me/profile` | `GET` | Instructor | استرجاع الملف الشخصي للمحاضر الحالي |
| `/api/v1/instructors/me/profile` | `PATCH` | Instructor | تعديل الملف الشخصي (نبذة، صورة، سوشيال) |
| `/api/v1/instructors/me/dashboard` | `GET` | Instructor | إحصائيات لوحة تحكم المحاضر |
| `/api/v1/instructors/me/programs` | `GET` | Instructor | قائمة البرامج المسندة للمحاضر مع إحصائيات الطلاب |
