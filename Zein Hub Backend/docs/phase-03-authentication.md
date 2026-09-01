# Zein Hub Backend — Phase 03: Authentication & Authorization

توثيق شامل لنظام المصادقة والصلاحيات (Authentication & RBAC) لمنصة **Zein Hub Media LMS**.

---

## 1. الأدوار في النظام (System Roles)

1. **`super_admin`**:
   - الصلاحية الكاملة على كل موارد النظام.
   - لا يمكن إنشاؤه عبر الـ Public APIs؛ يتم إنشاؤه فقط عبر سكريبت التهيئة `npm run seed:admin` من متغيرات البيئة.
2. **`instructor`**:
   - يتم إنشاؤه وإدارته حصريًا بواسطة الـ Super Admin.
   - صلاحياته محصورة في إدارة الكورسات والوحدات والدروس والاختبارات والواجبات والجلسات المسندة له في `assignedPrograms`.
3. **`student`**:
   - الدور الوحيد المتاح للتسجيل العام من خلال الـ Website عبر `POST /api/v1/auth/register`.

---

## 2. بروتوكول JWT (Tokens Architecture)

- **Access Token**:
  - مشفر بـ `JWT_ACCESS_SECRET`
  - مدة الصلاحية: `15m` (قصيرة للأمان)
  - الـ Payload: `{ userId, role, email }`
- **Refresh Token**:
  - مشفر بـ `JWT_REFRESH_SECRET`
  - مدة الصلاحية: `7d`
  - يستخدم للحصول على Access Token جديد عبر `POST /api/v1/auth/refresh-token`.

---

## 3. الـ Middlewares المنفذة

- [`requireAuth`](../src/middlewares/auth.middleware.ts):
  - استخراج Bearer Token من Header الـ `Authorization`.
  - التحقق من التوقيع والصلاحية.
  - التحقق من وجود المستخدم وأن حسابه نشط (`isActive: true`).
  - إرفاق `req.user = { id, role, email }`.
- [`requireRole(...roles)`](../src/middlewares/role.middleware.ts):
  - التحقق من توافق دور المستخدم الحالي مع الأدوار المسموح بها، وإرجاع `403 Forbidden` في حال عدم التطابق.
- [`verifyInstructorProgramAccess`](../src/middlewares/instructorAccess.middleware.ts):
  - السماح المباشر للـ `super_admin`.
  - فحص مصفوفة `assignedPrograms` في `InstructorProfile` للمحاضر ومطابقتها مع `programId` المطلوب؛ إرجاع `403 Forbidden` إذا كان البرنامج غير مسند للمحاضر.

---

## 4. المسارات والـ Endpoints

| المسار | الطريقة | التحقق | الصلاحية | الاستجابة |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | `registerSchema` | Public | `201 Created` + User & Tokens |
| `/api/v1/auth/login` | `POST` | `loginSchema` | Public | `200 OK` + User & Tokens |
| `/api/v1/auth/refresh-token` | `POST` | `refreshTokenSchema` | Public | `200 OK` + New Access Token |
| `/api/v1/auth/profile` | `GET` | `requireAuth` | Authenticated | `200 OK` + User Profile |
| `/api/v1/auth/admin-test` | `GET` | `requireRole(super_admin)` | Super Admin | `200 OK` |
| `/api/v1/auth/student-test` | `GET` | `requireRole(student)` | Student | `200 OK` |
| `/api/v1/auth/instructor-test/:programId` | `GET` | `verifyInstructorProgramAccess` | Instructor / Admin | `200 OK` / `403 Forbidden` |

---

## 5. قواعد الأمان المطبقة (Security Enforcement)

- **منع حقن الأدوار (Role Injection)**: أي محاولة لتمرير حقل `role` أثناء التسجيل يتم تجاهلها وتثبيت الدور كـ `student`.
- **تشفير كلمات المرور**: استخدام `bcryptjs` مع salt rounds = 10 عبر Pre-save Hook.
- **تجريد البيانات الحساسة**: حجب `password` من مخرجات JSON و Queries بشكل افتراضي (`select: false`).
- **معالجة الحسابات المعطلة**: التحقق التلقائي من `isActive === true` قبل قبول أي طلب مصادقة.
