# Zein Hub Media LMS — Complete Routes Reference

مرجع شامل ومدقق لجميع المسارات (`API Routes`) وطرق الاستدعاء (`HTTP Methods`)، متطلبات المصادقة (`Auth`)، ومستويات الصلاحيات (`RBAC`) في منصة **Zein Hub Media LMS**.

---

## 1. مسارات الصحة والنظام (Health & System)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | No (Public) | Anyone | فحص جاهزية الخادم وقاعدة البيانات على الجذر |
| `GET` | `/api/v1/health` | No (Public) | Anyone | فحص جاهزية الخادم وقاعدة البيانات على الإصدار v1 |

---

## 2. مسارات المصادقة والجلسات (Authentication & Cookies)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | No (Public) | Anyone | تسجيل طالب جديد وتثبيت كوكيز الجلسة |
| `POST` | `/api/v1/auth/login` | No (Public) | Anyone | تسجيل الدخول وتثبيت كوكيز `zh_access_token` و `zh_refresh_token` |
| `POST` | `/api/v1/auth/refresh-token` | No (Cookie) | Anyone | تجديد الـ Access Token تلقائياً عبر كوكيز الـ Refresh |
| `POST` | `/api/v1/auth/logout` | No (Public) | Anyone | تسجيل الخروج وتفريغ كوكيز المصادقة فوراً |
| `GET` | `/api/v1/auth/profile` | Yes (Cookie) | Authenticated | استعراض بيانات الحساب الشخصي للمستخدم الحالي |

---

## 3. مسارات المسارات والتخصصات (Tracks)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/tracks` | No (Public) | Anyone | استعراض جميع المسارات التدريبية العامة |
| `GET` | `/api/v1/tracks/:idOrSlug` | No (Public) | Anyone | استعراض تفاصيل مسار تدريبي بالمعرف أو الـ Slug |
| `POST` | `/api/v1/tracks` | Yes | `super_admin` | إنشاء مسار تدريبي جديد |
| `PATCH` | `/api/v1/tracks/:id` | Yes | `super_admin` | تعديل بيانات مسار تدريبي |
| `DELETE` | `/api/v1/tracks/:id` | Yes | `super_admin` | حذف مسار تدريبي |

---

## 4. مسارات البرامج التدريبية (Programs)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/programs` | No (Public) | Anyone | استعراض البرامج التدريبية مع البحث والفلترة والصفحات |
| `GET` | `/api/v1/programs/featured` | No (Public) | Anyone | استعراض البرامج التدريبية المميزة |
| `GET` | `/api/v1/programs/:idOrSlug` | No (Public) | Anyone | تفاصيل برنامج تدريبي بالمعرف أو الـ Slug |
| `POST` | `/api/v1/programs` | Yes | `super_admin` | إنشاء برنامج تدريبي جديد |
| `PATCH` | `/api/v1/programs/:id` | Yes | `super_admin` | تعديل بيانات برنامج تدريبي |
| `PATCH` | `/api/v1/programs/:id/status` | Yes | `super_admin` | تغيير حالة البرنامج (`open`, `coming-soon`, `closed`) |
| `PATCH` | `/api/v1/programs/:id/featured` | Yes | `super_admin` | تمييز البرنامج كبرنامج رئيسي |
| `POST` | `/api/v1/programs/:id/assign-instructor` | Yes | `super_admin` | إسناد محاضر للبرنامج |
| `POST` | `/api/v1/programs/:id/unassign-instructor` | Yes | `super_admin` | إلغاء إسناد محاضر من البرنامج |
| `DELETE` | `/api/v1/programs/:id` | Yes | `super_admin` | حذف برنامج تدريبي |

---

## 5. مسارات المحاضرين (Instructors)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/instructors` | Yes | `super_admin` | إنشاء حساب محاضر جديد وتحديد تخصصاته وبرامجه |
| `GET` | `/api/v1/instructors/me/profile` | Yes | `instructor` | استعراض المحاضر لملفه الشخصي |
| `PATCH` | `/api/v1/instructors/me/profile` | Yes | `instructor` | تعديل المحاضر لنبذته وخبراته |
| `GET` | `/api/v1/instructors/me/dashboard` | Yes | `instructor` | إحصائيات ومؤشرات لوحة تحكم المحاضر |
| `GET` | `/api/v1/instructors/me/programs` | Yes | `instructor` | استعراض البرامج المسندة للمحاضر |
| `GET` | `/api/v1/instructors/admin/all` | Yes | `super_admin` | قائمة كافة المحاضرين مع الفلترة والصفحات |
| `GET` | `/api/v1/instructors/:id` | Yes | `super_admin` | تفاصيل ملف المحاضر الكاملة |
| `PATCH` | `/api/v1/instructors/:id` | Yes | `super_admin` | تعديل بيانات المحاضر الإدارية |
| `PATCH` | `/api/v1/instructors/:id/status` | Yes | `super_admin` | تفعيل أو تعطيل حساب المحاضر |
| `PUT` | `/api/v1/instructors/:id/assigned-programs` | Yes | `super_admin` | تحديث قائمة البرامج المسندة للمحاضر |

---

## 6. مسارات طلبات التقديم (Applications)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/applications` | Yes | `student` | تقديم طلب التحاق ببرنامج مفتوح |
| `GET` | `/api/v1/applications/me` | Yes | `student` | استعراض الطالب لجميع طلبات التقديم الخاصة به |
| `GET` | `/api/v1/applications/me/:id` | Yes | `student` | استعراض تفاصيل طلب تقديم محدد للطالب |
| `GET` | `/api/v1/applications` | Yes | `super_admin` | استعراض ومراجعة كافة طلبات التقديم في النظام |
| `GET` | `/api/v1/applications/:id` | Yes | `super_admin` | تفاصيل طلب تقديم محدد للإدارة |
| `PATCH` | `/api/v1/applications/:id/review` | Yes | `super_admin` | قبول (`accepted`) أو رفض (`rejected`) طلب التقديم |

---

## 7. مسارات الاشتراكات (Enrollments)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/enrollments/me` | Yes | `student` | استعراض الطالب لكافة اشتراكاته الفعالة والمنتهية |
| `GET` | `/api/v1/enrollments/me/:programId` | Yes | `student` | استعراض حالة اشتراك الطالب في برنامج محدد |
| `GET` | `/api/v1/enrollments/admin/all` | Yes | `super_admin` | استعراض كافة اشتراكات المنصة للإدارة |
| `PATCH` | `/api/v1/enrollments/:id/status` | Yes | `super_admin` | تعديل حالة الاشتراك (`active`, `completed`, `dropped`) |

---

## 8. مسارات الوحدات والمنهج (Course Modules)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/programs/:programId/modules` | Optional | Context-Aware | استعراض وحدات ومنهج البرنامج |
| `POST` | `/api/v1/programs/:programId/modules` | Yes | `super_admin`, `instructor` | إنشاء وحدة تدريبية جديدة في البرنامج |
| `GET` | `/api/v1/course-modules/:id` | Optional | Context-Aware | استعراض تفاصيل وحدة تدريبية |
| `PATCH` | `/api/v1/course-modules/:id` | Yes | `super_admin`, `instructor` | تعديل بيانات وترتيب الوحدة التدريبية |
| `DELETE` | `/api/v1/course-modules/:id` | Yes | `super_admin`, `instructor` | حذف وحدة تدريبية |

---

## 9. مسارات الدروس والمحتوى (Lessons & Content)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/course-modules/:moduleId/lessons` | Optional | Context-Aware | استعراض دروس الوحدة (مع حجب وسائط الدروس المدفوعة) |
| `POST` | `/api/v1/course-modules/:moduleId/lessons` | Yes | `super_admin`, `instructor` | إنشاء درس جديد داخل الوحدة |
| `GET` | `/api/v1/lessons/:id` | Optional | Context-Aware | تفاصيل الدرس (تتطلب اشتراكاً فعالاً للدروس المدفوعة) |
| `PATCH` | `/api/v1/lessons/:id` | Yes | `super_admin`, `instructor` | تعديل محتوى وبيانات الدرس |
| `DELETE` | `/api/v1/lessons/:id` | Yes | `super_admin`, `instructor` | حذف الدرس |
| `POST` | `/api/v1/lessons/:lessonId/complete` | Yes | `student` | تسجيل إتمام الدرس وتحديث نسبة إنجاز البرنامج |

---

## 10. مسارات الاختبارات القصيرة (Quizzes & Questions)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/lessons/:lessonId/quizzes` | Optional | Context-Aware | استعراض اختبارات الدرس |
| `POST` | `/api/v1/lessons/:lessonId/quizzes` | Yes | `super_admin`, `instructor` | إنشاء اختبار قصير داخل الدرس |
| `GET` | `/api/v1/quizzes/:id` | Optional | Context-Aware | تفاصيل الاختبار (محجوبة الإجابات الصحيحة عن الطلاب) |
| `PATCH` | `/api/v1/quizzes/:id` | Yes | `super_admin`, `instructor` | تعديل إعدادات ودرجة نجاح الاختبار |
| `DELETE` | `/api/v1/quizzes/:id` | Yes | `super_admin`, `instructor` | حذف الاختبار |
| `POST` | `/api/v1/quizzes/:id/questions` | Yes | `super_admin`, `instructor` | إضافة سؤال جديد للاختبار |
| `PATCH` | `/api/v1/quizzes/questions/:id` | Yes | `super_admin`, `instructor` | تعديل خيارات ودرجة السؤال |
| `DELETE` | `/api/v1/quizzes/questions/:id` | Yes | `super_admin`, `instructor` | حذف سؤال من الاختبار |
| `POST` | `/api/v1/quizzes/:id/submit` | Yes | `student` | تسليم إجابات الاختبار وحساب النتيجة آلياً |

---

## 11. مسارات التكليفات العملية والتسليمات (Assignments & Submissions)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/lessons/:lessonId/assignments` | Optional | Context-Aware | استعراض التكليفات العملية للدرس |
| `POST` | `/api/v1/lessons/:lessonId/assignments` | Yes | `super_admin`, `instructor` | إنشاء تكليف عملي داخل الدرس |
| `GET` | `/api/v1/assignments/:id` | Optional | Context-Aware | تفاصيل التكليف العملي |
| `PATCH` | `/api/v1/assignments/:id` | Yes | `super_admin`, `instructor` | تعديل التكليف العملي |
| `DELETE` | `/api/v1/assignments/:id` | Yes | `super_admin`, `instructor` | حذف التكليف العملي |
| `POST` | `/api/v1/assignments/:id/submit` | Yes | `student` | تسليم الطالب للتكليف العملي (ملف/صوت/فيديو) |
| `GET` | `/api/v1/assignments/:id/my-submission` | Yes | `student` | استعراض تسليم الطالب ودرجته وملاحظات المحاضر |
| `GET` | `/api/v1/assignments/:id/submissions` | Yes | `super_admin`, `instructor` | استعراض كافة تسليمات الطلاب للتكليف |
| `PATCH` | `/api/v1/submissions/:id/grade` | Yes | `super_admin`, `instructor` | تصحيح تسليم الطالب ورصد الدرجة والملاحظات |

---

## 12. مسارات التقدم الأكاديمي (Progress Tracking)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/progress/me` | Yes | `student` | تقدم الطالب في جميع البرامج المشترك بها |
| `GET` | `/api/v1/progress/me/:programId` | Yes | `student` | تقدم ودرجات الطالب في برنامج محدد |
| `GET` | `/api/v1/progress/program/:programId` | Yes | `super_admin`, `instructor` | تقدم كافة طلاب البرنامج للإدارة والمحاضر |
| `POST` | `/api/v1/progress/program/:programId/recalculate` | Yes | `super_admin`, `instructor` | إعادة احتساب نسب الإنجاز والتخرج للبرنامج |

---

## 13. مسارات الشهادات المعتمدة (Certificates)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/certificates/me` | Yes | `student` | شهادات التخرج الصادرة للطالب |
| `GET` | `/api/v1/certificates/:id` | Optional | Context-Aware | تفاصيل الشهادة المعتمدة |
| `GET` | `/api/v1/certificates/verify/:certificateNumber` | No (Public) | Anyone | التحقق العام من صحة الشهادة برقمها الفريد |
| `GET` | `/api/v1/certificates/:certificateNumber/verify` | No (Public) | Anyone | التحقق العام من صحة الشهادة (مسار بديل) |

---

## 14. مسارات الجلسات التفاعلية المباشرة (Live Sessions)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/programs/:programId/sessions` | Optional | Context-Aware | استعراض جلسات البرنامج (حجب الروابط لغير المشتركين) |
| `POST` | `/api/v1/programs/:programId/sessions` | Yes | `super_admin`, `instructor` | جدولة جلسة تفاعلية مباشرة (Meet / Zoom / Teams) |
| `GET` | `/api/v1/sessions/:id` | Optional | Context-Aware | تفاصيل الجلسة وروابط الدخول للمشتركين |
| `PATCH` | `/api/v1/sessions/:id` | Yes | `super_admin`, `instructor` | تعديل موعد وبيانات الجلسة |
| `PATCH` | `/api/v1/sessions/:id/status` | Yes | `super_admin`, `instructor` | تغيير حالة الجلسة (`scheduled`, `live`, `completed`, `cancelled`) |
| `DELETE` | `/api/v1/sessions/:id` | Yes | `super_admin`, `instructor` | إلغاء أو حذف الجلسة |

---

## 15. مسارات الحضور والغياب (Attendance)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/sessions/:sessionId/attendance` | Yes | `super_admin`, `instructor` | كشف حضور وغياب طلاب الجلسة |
| `POST` | `/api/v1/sessions/:sessionId/attendance` | Yes | `super_admin`, `instructor` | رصد حضور الطالب (`present`, `late`, `absent`, `excused`) |
| `PATCH` | `/api/v1/sessions/:sessionId/attendance` | Yes | `super_admin`, `instructor` | تعديل حالة حضور الطالب والدقائق والملاحظات |
| `GET` | `/api/v1/sessions/:sessionId/attendance/me` | Yes | `student` | حالة حضور الطالب في الجلسة المحددة |
| `GET` | `/api/v1/attendance/me` | Yes | `student` | سجل حضور الطالب الكامل في جميع البرامج |
| `GET` | `/api/v1/attendance/program/:programId` | Yes | `super_admin`, `instructor` | ملخص ومعدلات حضور البرنامج التدريبي |
| `GET` | `/api/v1/attendance/program/:programId/summary` | Yes | `super_admin`, `instructor` | ملخص حضور البرنامج التدريبي (مسار بديل) |

---

## 16. مسارات التقييمات والآراء (Reviews & Testimonials)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/programs/:programId/reviews` | Yes | `student` | إرسال تقييم للبرنامج (1-5 نجوم، يدخل حالة `pending`) |
| `GET` | `/api/v1/programs/:programId/reviews` | No (Public) | Anyone | استعراض التقييمات المعتمدة ومتوسط النجوم للبرنامج |
| `GET` | `/api/v1/reviews/approved` | No (Public) | Anyone | استعراض آراء الطلاب المعتمدة العامة مع الفلترة والصفحات |
| `GET` | `/api/v1/reviews/me` | Yes | `student` | استعراض تقييمات الطالب وحالات اعتمادها |
| `GET` | `/api/v1/reviews/admin/all` | Yes | `super_admin` | استعراض كافة التقييمات للإدارة بمختلف حالاتها |
| `GET` | `/api/v1/reviews/:id` | Optional | Context-Aware | تفاصيل التقييم (محجوبة عن العامة إن لم تكن معتمدة) |
| `PATCH` | `/api/v1/reviews/:id` | Yes | `student` (Owner) | تعديل التقييم (يعاد تلقائياً إلى حالة `pending`) |
| `DELETE` | `/api/v1/reviews/:id` | Yes | Owner / Admin | حذف التقييم |
| `PATCH` | `/api/v1/reviews/:id/moderate` | Yes | `super_admin` | اعتماد أو رفض التقييم ورصد ملاحظات التدقيق |

---

## 17. مسارات لوحة التحكم والتحليلات (Admin Dashboard & Analytics)
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard/overview` | Yes | Admin / Scoped Instructor | مؤشرات الأداء الإجمالية KPIs للوحة التحكم |
| `GET` | `/api/v1/admin/analytics/enrollments` | Yes | Admin / Scoped Instructor | تحليلات الاشتراكات وتوزيعها حسب المسارات والبرامج |
| `GET` | `/api/v1/admin/analytics/progress` | Yes | Admin / Scoped Instructor | تحليلات تقدم الطلاب وشرائح الإنجاز Tiers (0-100%) |
| `GET` | `/api/v1/admin/analytics/attendance` | Yes | Admin / Scoped Instructor | تحليلات ومعدلات حضور الجلسات التفاعلية |
| `GET` | `/api/v1/admin/analytics/assessments` | Yes | Admin / Scoped Instructor | تحليلات درجات الاختبارات والتكليفات والتسليمات |
| `GET` | `/api/v1/admin/analytics/certificates` | Yes | Admin / Scoped Instructor | تحليلات الشهادات ومعدلات التحويل للتخرج |
| `GET` | `/api/v1/admin/analytics/reviews` | Yes | Admin / Scoped Instructor | تحليلات آراء الطلاب ومتوسط الرضا وتوزيع النجوم |
| `GET` | `/api/v1/admin/reports/programs/:programId` | Yes | Admin / Scoped Instructor | تقرير أداء تفصيلي شامل لبرنامج تدريبي محدد |
| `GET` | `/api/v1/admin/reports/students` | Yes | Admin / Scoped Instructor | تقرير تشغيلي ببيانات أداء الطلاب والاشتراكات |
| `GET` | `/api/v1/admin/reports/enrollments` | Yes | Admin / Scoped Instructor | تقرير تشغيلي للاشتراكات مع دعم الصفحات |
