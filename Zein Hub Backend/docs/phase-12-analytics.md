# Zein Hub Backend — Phase 12: Super Admin Dashboard & System Analytics

توثيق شامل لطبقة مؤشرات الأداء الرئيسية والتحليلات الشاملة (`Super Admin Dashboard & System Analytics`) والتقارير المجمعة عبر أنابيب التجميع الفعالة (`MongoDB Aggregation Pipelines`) لمنصة **Zein Hub Media LMS**.

---

## 1. قواعد العمل والـ Business Logic

1. **صلاحيات الوصول والـ RBAC Scoping**:
   - **الـ Super Admin**: وصول شامل وغير مقيد لكافة إحصائيات المنصة، البرامج، المسارات، والتقارير.
   - **المحاضر (Instructor)**: تقييد الإحصائيات والتقارير حصرياً للبرامج المسندة له في ملفه (`assignedPrograms`).
   - **الطلاب والزوار**: حظر كامل لجميع مسارات الـ `/admin` (`403 Forbidden` / `401 Unauthorized`).
2. **محرك التحليلات وأنابيب التجميع (Aggregation Pipelines)**:
   - بناء الحسابات الرياضية والمعدلات بالاعتماد الكامل على محرك التجميع (`MongoDB Aggregation Pipelines`) دون سحب البيانات للذاكرة عشوائياً، مما يضمن أداءً عالياً وقابلية توسع للبيانات الضخمة.
3. **أقسام التحليلات والتقارير**:
   - **لوحة المؤشرات العامة (Dashboard KPIs)**: إجمالي المستخدمين، البرامج، الطلبات، الاشتراكات، معدلات الإنجاز، الشهادات، ومتوسط الرضا العام.
   - **تحليلات الاشتراكات (Enrollments)**: التوزيع حسب المسارات والبرامج وحالات الاشتراك.
   - **تحليلات التقدم (Progress Tiers)**: توزيع مستويات إنجاز الطلاب (0-24%, 25-49%, 50-74%, 75-99%, 100%).
   - **تحليلات الحضور (Attendance)**: معدل الحضور العام وتوزيع الحالات (حضور، تأخير، غياب، عذر).
   - **تحليلات التقييمات (Assessments)**: معدلات نجاح الاختبارات، متوسط الدرجات، وحالة تسليمات التكليفات.
   - **تحليلات الشهادات (Certificates)**: معدل التحويل من اشتراك إلى تخرج وإجمالي الشهادات المعتمدة.
   - **تحليلات التقييمات والآراء (Reviews)**: متوسط تقييم المنصة وتوزيع النجوم وطابور التدقيق.
   - **التقارير التفصيلية المخصصة (Detailed Program Report)**: تقرير شامل لكل برنامج ومؤشرات أداء طلابه.

---

## 2. جدول الـ Endpoints

### مسارات لوحة التحكم والتحليلات (`/api/v1/admin`)
| المسار | الطريقة | الصلاحية | الوصف |
| :--- | :--- | :--- | :--- |
| `/api/v1/admin/dashboard/overview` | `GET` | Admin / Scoped Instructor | المؤشرات الإجمالية KPIs للوحة التحكم |
| `/api/v1/admin/analytics/enrollments` | `GET` | Admin / Scoped Instructor | تحليلات الاشتراكات وتوزيعها حسب المسارات والبرامج |
| `/api/v1/admin/analytics/progress` | `GET` | Admin / Scoped Instructor | تحليلات تقدم الطلاب ومستويات الإنجاز (Tiers) |
| `/api/v1/admin/analytics/attendance` | `GET` | Admin / Scoped Instructor | تحليلات ونسب حضور الجلسات التفاعلية |
| `/api/v1/admin/analytics/assessments` | `GET` | Admin / Scoped Instructor | تحليلات درجات الاختبارات والتكليفات والتسليمات |
| `/api/v1/admin/analytics/certificates` | `GET` | Admin / Scoped Instructor | تحليلات الشهادات ومعدلات التخرج والتحويل |
| `/api/v1/admin/analytics/reviews` | `GET` | Admin / Scoped Instructor | تحليلات آراء الطلاب ومتوسط التقييم وتوزيع النجوم |
| `/api/v1/admin/reports/programs/:programId` | `GET` | Admin / Scoped Instructor | تقرير أداء تفصيلي شامل لبرنامج تدريبي محدد |
| `/api/v1/admin/reports/students` | `GET` | Admin / Scoped Instructor | تقرير تشغيلي ببيانات الطلاب والاشتراكات مع الصفحات |
