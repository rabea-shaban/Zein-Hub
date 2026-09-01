# Zein Hub Backend — Phase 10: Live Sessions & Attendance Management

توثيق شامل لنظام الجلسات التفاعلية المباشرة (`Live Sessions`) عبر مزودي الاجتماعات (`Google Meet`, `Zoom`, `Microsoft Teams`)، ونظام تسجيل وإدارة حضور وغياب الطلاب (`Attendance`)، وحساب نسب ومعدلات الحضور لمنصة **Zein Hub Media LMS**.

---

## 1. قواعد العمل والـ Business Logic

1. **إدارة الجلسات التفاعلية المباشرة (Live Sessions Management)**:
   - إنشاء وإدارة الجلسات محصورة في الـ Super Admin والمحاضر المسند للبرنامج (`assignedPrograms`).
   - دعم منصات الاجتماعات المعتمدة: `google_meet` و `zoom` و `teams` و `other`.
   - دورة حياة الجلسة: `scheduled` $\rightarrow$ `live` $\rightarrow$ `completed` أو `cancelled`.
   - **حماية روابط الجلسات**: حجب وإخفاء روابط الدخول وكلمات المرور عن الزوار والطلاب غير المشتركين، وإتاحتها حصرياً للطلاب المقيدين بالبرنامج.
2. **نظام تسجيل الحضور (Attendance System)**:
   - حالات الحضور: `present` (حضور كامل)، `late` (حضور متأخر)، `absent` (غياب)، `excused` (عذر مقبول).
   - تسجيل دقائق الحضور (`attendanceMinutes`) ووقت الانضمام والمغادرة والملاحظات.
   - منع تسجيل حضور أي طالب غير مشترك بالبرنامج.
   - منع تسجيل حضور أي جلسة ملغاة (`cancelled`).
   - منع تكرار سجل الحضور للطالب في نفس الجلسة بفضل الفهرس الفريد المركب (`liveSessionId + studentId`).
3. **حساب نسبة الحضور (Attendance Percentage)**:
   - احتساب نسبة الحضور كمعيار مستقل منفصل عن نسبة مشاهدة الدروس المسجلة:
     $$\text{attendancePercentage} = \frac{\text{الجلسات المحضورة (present + late)}}{\text{إجمالي الجلسات المؤهلة (المنعقدة - المعذورة)}} \times 100$$

---

## 2. جدول الـ Endpoints

### مسارات الجلسات المباشرة (Live Sessions)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/programs/:programId/sessions` | `POST` | Admin / Assigned Instructor | جدولة جلسة تفاعلية مباشرة للبرنامج |
| `/api/v1/programs/:programId/sessions` | `GET` | Context-Aware | استعراض جلسات البرنامج (حماية الروابط لغير المشتركين) |
| `/api/v1/sessions/:id` | `GET` | Context-Aware / Enrolled | تفاصيل الجلسة ورابط الدخول |
| `/api/v1/sessions/:id` | `PATCH` | Admin / Assigned Instructor | تعديل بيانات الجلسة وموعدها |
| `/api/v1/sessions/:id/status` | `PATCH` | Admin / Assigned Instructor | تغيير حالة الجلسة (live / completed / cancelled) |
| `/api/v1/sessions/:id` | `DELETE` | Admin / Assigned Instructor | حذف الجلسة وسجلات الحضور المرتبطة |

### مسارات الحضور والغياب (Attendance)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/sessions/:sessionId/attendance` | `POST / PATCH` | Admin / Assigned Instructor | رصد وتحديث حضور الطلاب بالجلسة |
| `/api/v1/sessions/:sessionId/attendance` | `GET` | Admin / Assigned Instructor | قائمة حضور وغياب الطلاب بالجلسة |
| `/api/v1/sessions/:sessionId/attendance/me` | `GET` | Student | استعراض حالة حضور الطالب بالجلسة |
| `/api/v1/attendance/me` | `GET` | Student | سجل الحضور الكامل للطالب في جميع البرامج |
| `/api/v1/attendance/program/:programId/summary` | `GET` | Admin / Assigned Instructor | ملخص ونسب حضور الطلاب بالبرنامج |
