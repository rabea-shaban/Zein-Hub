# Zein Hub Media LMS — API Documentation

الدليل المرجعي الفني والتقني الشامل لواجهات برمجة التطبيقات (`REST API Documentation`) لمنصة **Zein Hub Media LMS**.

---

## 1. Introduction
منصة **Zein Hub Media LMS** هي منصة تدريب وتعليم رقمي متقدمة في مجالات الإعلام والصوتيات والتقنيات الحديثة (Voice-Over, Smart Podcasting, Audio Production, Media Presentation). يوفر الـ Backend منظومة متكاملة لإدارة المسارات والبرامج، طلبات الالتحاق والاشتراكات، المناهج والدروس التفاعلية، الاختبارات المؤتمتة، التكليفات العملية وتصحيحها، تتبع التقدم، إصدار الشهادات الرقمية، إدارة الجلسات المباشرة والحضور، المراجعات والتقييمات، ولوحة التحكم والتحليلات الشاملة.

---

## 2. Tech Stack
- **Runtime Environment:** Node.js (v20+)
- **Framework:** Express.js (v5)
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose (v9)
- **Authentication:** JWT (JSON Web Tokens) with `httpOnly Secure Cookies` (`zh_access_token`, `zh_refresh_token`)
- **Validation:** Joi Schema Validation
- **Security:** Helmet, Express Rate Limit, NoSQL & XSS Sanitization, HTTP Security Headers
- **Performance:** Response Compression, Compound Database Indexing, Aggregation Pipelines

---

## 3. Base URLs & Environments
- **Development Base URL:** `http://localhost:5000/api/v1`
- **Production Base URL:** `https://api.zeinhub.com/api/v1` (Placeholder for production deployment)
- **Interactive Swagger UI:** `http://localhost:5000/api/docs`
- **OpenAPI 3.0 JSON Specification:** `http://localhost:5000/api/docs.json`

---

## 4. Authentication Architecture (httpOnly Cookies)
تعتمد المنصة كلياً على كوكيز المتصفح الآمنة المشفرة (`httpOnly Secure Cookies`):
- **`zh_access_token`**:
  - `httpOnly: true`, `secure: true (in production)`, `sameSite: 'lax'/'strict'`.
  - مدة الصلاحية: 15 دقيقة (`maxAge: 15m`).
- **`zh_refresh_token`**:
  - `httpOnly: true`, `secure: true`, `sameSite: 'lax'/'strict'`.
  - مدة الصلاحية: 7 أيام (`maxAge: 7d`).

### دورة حياة المصادقة:
1. **تسجيل الدخول / التسجيل (`POST /auth/login` أو `POST /auth/register`):** يضع الخادم كوكيز المصادقة تلقائياً في المتصفح.
2. **الطلبات المحمية:** يرسل المتصفح الكوكيز تلقائياً مع كل طلب دون الحاجة لإرسال ترويسة `Authorization` يدوياً (مع دعم اختياري لـ `Bearer <token>` في حال استخدام تطبيقات الموبايل).
3. **تجديد التوكن (`POST /auth/refresh-token`):** يتم التحقق من كوكيز الـ `zh_refresh_token` وتجديد كوكيز الـ `zh_access_token` تلقائياً دون الحاجة لتمرير بيانات في جسم الطلب.
4. **تسجيل الخروج (`POST /auth/logout`):** يقوم الخادم بتفريغ وحذف الكوكيز فوراً من المتصفح.

---

## 5. Roles & Permissions (RBAC Matrix)

| Resource / Action | Super Admin | Instructor | Student | Public / Guest |
| :--- | :---: | :---: | :---: | :---: |
| **Public Tracks & Programs Catalog** | Read / Write | Read | Read | Read |
| **Free Preview Lessons** | Full Access | Full Access | Full Access | Read |
| **Paid Lessons Media & Resources** | Full Access | Assigned Only | Enrolled Only | ❌ Forbidden |
| **Submit Applications & Reviews** | Read Only | ❌ Forbidden | Write (Own) | ❌ Forbidden |
| **Manage Curriculum & Lessons** | Full Access | Assigned Only | ❌ Forbidden | ❌ Forbidden |
| **Manage Quizzes & Assignments** | Full Access | Assigned Only | ❌ Forbidden | ❌ Forbidden |
| **Grade Student Submissions** | Full Access | Assigned Only | ❌ Forbidden | ❌ Forbidden |
| **Live Sessions Management** | Full Access | Assigned Only | ❌ Forbidden | ❌ Forbidden |
| **Access Meeting Links** | Full Access | Assigned Only | Enrolled Only | ❌ Forbidden |
| **Mark & Update Attendance** | Full Access | Assigned Only | ❌ Forbidden | ❌ Forbidden |
| **Review Testimonials Moderation** | Full Access | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **System Dashboard & Analytics** | Global KPIs | Scoped to Assigned | ❌ Forbidden | ❌ Forbidden |
| **Verify Certificates Publicly** | Read | Read | Read | Read |

---

## 6. Endpoints Documentation

### 6.1 Authentication (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
- **الوصف:** تسجيل حساب طالب جديد وتثبيت كوكيز الجلسة.
- **الصلاحية:** Public (معدل: 20 طلب / 15 دقيقة).
- **Request Body:**
  ```json
  {
    "fullName": "Ahmed Samy",
    "email": "ahmed.samy@example.com",
    "password": "SecurePassword123!",
    "phone": "+201012345678"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Student registration successful",
    "data": {
      "user": {
        "id": "6a966961a065f0074a856190",
        "fullName": "Ahmed Samy",
        "email": "ahmed.samy@example.com",
        "role": "student"
      }
    }
  }
  ```

#### `POST /api/v1/auth/login`
- **الوصف:** تسجيل الدخول وتثبيت كوكيز `zh_access_token` و `zh_refresh_token`.
- **الصلاحية:** Public (معدل: 20 طلب / 15 دقيقة).
- **Request Body:**
  ```json
  {
    "email": "admin@zeinhub.com",
    "password": "Admin@ZeinHub2026!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "6a95ab62d2f46d39d6b86c71",
        "fullName": "Super Admin",
        "email": "admin@zeinhub.com",
        "role": "super_admin"
      }
    }
  }
  ```

#### `POST /api/v1/auth/refresh-token`
- **الوصف:** تجديد صلاحية الـ Access Token عبر كوكيز الـ Refresh.
- **Request Body:** `{}` (يقرأ الكوكيز تلقائياً).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Access token refreshed successfully"
  }
  ```

#### `POST /api/v1/auth/logout`
- **الوصف:** تسجيل الخروج وتفريغ كوكيز المصادقة.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Logged out successfully and auth session cleared"
  }
  ```

#### `GET /api/v1/auth/profile`
- **الوصف:** استعراض الملف الشخصي للمستخدم الحالي عبر كوكيز المصادقة.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "user": {
        "id": "6a95ab62d2f46d39d6b86c71",
        "fullName": "Super Admin",
        "email": "admin@zeinhub.com",
        "role": "super_admin"
      }
    }
  }
  ```

---

### 6.2 Instructors (`/api/v1/instructors`)

#### `PATCH /api/v1/instructors/me/profile`
- **الوصف:** تعديل المحاضر لملفه الشخصي (الصورة الشخصية، النبذة، روابط التواصل، التخصصات، سنوات الخبرة، وتغيير كلمة المرور).
- **الصلاحية:** `instructor` (محمية بالكوكيز / التوكن).
- **Request Body:**
  ```json
  {
    "fullName": "Dr. Tarek Voice",
    "phone": "+201099998888",
    "avatarUrl": "https://cdn.zeinhub.com/avatars/dr_tarek.jpg",
    "photoUrl": "https://cdn.zeinhub.com/avatars/dr_tarek.jpg",
    "bio": "خبير إذاعي ومدرب صوتي معتمد لدى كبرى المنصات الرقمية وقنوات الإعلام.",
    "specializations": ["Voice Over", "Vocal Acoustics", "Smart Podcasting"],
    "experienceYears": 16,
    "reelUrl": "https://cdn.zeinhub.com/reels/dr_tarek_showreel.mp4",
    "newPassword": "NewSecurePassword2026!",
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/drtarekvoice",
      "youtube": "https://youtube.com/@drtarekvoice",
      "portfolio": "https://drtarekvoice.com"
    }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Instructor profile updated successfully",
    "data": {
      "user": {
        "id": "6a966961a065f0074a856191",
        "fullName": "Dr. Tarek Voice",
        "avatarUrl": "https://cdn.zeinhub.com/avatars/dr_tarek.jpg"
      },
      "instructorProfile": {
        "bio": "خبير إذاعي ومدرب صوتي معتمد...",
        "specializations": ["Voice Over", "Vocal Acoustics", "Smart Podcasting"],
        "experienceYears": 16,
        "photoUrl": "https://cdn.zeinhub.com/avatars/dr_tarek.jpg"
      }
    }
  }
  ```

---

### 6.3 Programs & Tracks (`/api/v1/programs`, `/api/v1/tracks`)

#### `GET /api/v1/programs`
- **الوصف:** استعراض قائمة البرامج التدريبية المتاحة مع الفلترة والبحث والصفحات.
- **Query Params:** `page`, `limit`, `search`, `trackId`, `status`, `level`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Programs retrieved successfully",
    "data": [
      {
        "_id": "6a95ab62d2f46d39d6b86c73",
        "titleAr": "دبلوم التعليق الصوتي والفوكاليز الرقمي",
        "titleEn": "Voice-Over & Digital Vocalise",
        "slug": "voice-over-digital-vocalise",
        "status": "open",
        "price": 3500
      }
    ],
    "meta": { "page": 1, "limit": 10, "total": 13, "totalPages": 2 }
  }
  ```

---

### 6.3 Course Curriculum & Lessons (`/api/v1/course-modules`, `/api/v1/lessons`)

#### `GET /api/v1/lessons/:id`
- **الوصف:** استعراض تفاصيل الدرس (تتطلب اشتراكاً فعالاً للدروس المدفوعة).
- **Response (200 OK للمشترك أو الدرس المجاني):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "_id": "6a95bc927ad0d5ee3d1b1841",
      "title": "Lesson 1: Studio Setup & Microphone Warmup",
      "contentType": "video",
      "contentUrl": "https://cdn.zeinhub.com/secure/audio-mastery.mp4",
      "isFreePreview": false
    }
  }
  ```
- **Response (403 Forbidden لغير المشتركين في الدروس المدفوعة):**
  ```json
  {
    "success": false,
    "statusCode": 403,
    "errorCode": "FORBIDDEN",
    "message": "Active enrollment required to access this lesson"
  }
  ```

---

### 6.4 Certificates (`/api/v1/certificates`)

#### `GET /api/v1/certificates/verify/:certificateNumber`
- **الوصف:** التحقق العام من صحة ومصداقية الشهادة برقمها المرجعي الفريد دون الحاجة لأي مصادقة.
- **Response (200 OK للشهادة الصالحة):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Certificate verified successfully",
    "data": {
      "isValid": true,
      "certificateNumber": "ZH-VOI-2026-A1B2C3",
      "studentName": "Youssef Reviewer",
      "programTitleAr": "دبلوم التعليق الصوتي والفوكاليز الرقمي",
      "finalGrade": 92,
      "issuedAt": "2026-08-31T17:42:00.000Z"
    }
  }
  ```

---

### 6.5 Admin Dashboard & Analytics (`/api/v1/admin`)

#### `GET /api/v1/admin/dashboard/overview`
- **الوصف:** مؤشرات الأداء الإجمالية KPIs للمنصة (مقيدة للمحاضر بالبرامج المسندة له).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Super Admin dashboard overview KPIs retrieved successfully",
    "data": {
      "users": { "totalStudents": 22, "totalInstructors": 2, "activeStudents": 22 },
      "programs": { "total": 13, "open": 10, "comingSoon": 2, "closed": 1 },
      "applications": { "total": 12, "pending": 2, "accepted": 8, "rejected": 2 },
      "enrollments": { "total": 6, "active": 5, "completed": 1, "cancelled": 0 },
      "academic": { "averageCompletionRate": 100, "averageFinalGrade": 92, "totalCertificatesIssued": 1 },
      "attendance": { "overallAttendanceRate": 100, "totalLiveSessions": 4 },
      "reviews": { "averagePlatformRating": 5.0, "totalReviews": 1, "pendingModerationCount": 0 }
    }
  }
  ```

---

## 7. Security & Hardening Features
1. **Rate Limiting:**
   - مسارات الـ API العامة: 300 طلب / 15 دقيقة لكل IP.
   - مسارات المصادقة (`/auth/login`, `/auth/register`): 20 محاولة / 15 دقيقة لمنع هجمات القوة الغاشمة.
2. **NoSQL & XSS Sanitization:** تطهير تكراري للطلبات وإزالة وسوم `<script>` ومشغلات الاستعلام `$ne`, `$gt`, `$where`.
3. **Security Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`.
4. **Response Compression:** ضغط استجابات الـ JSON التي تتجاوز 1 كيلوبايت.

---

## 8. Error Responses Standard Format
تعتمد المنصة نسقاً موحداً للاستجابات الخاطئة:
```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_FAILED",
  "message": "Validation Error",
  "errors": [
    "Full name must be at least 2 characters long"
  ]
}
```

### أكواد الحالات الشائعة:
- **`400 Bad Request`**: خطأ في مدخلات الطلب أو التحقق من البيانات (`Joi Validation`).
- **`401 Unauthorized`**: غياب كوكيز المصادقة أو انتهاء صلاحية الجلسة.
- **`403 Forbidden`**: محاولة الوصول لمحتوى مدفوع أو لوحة الإدارة دون امتلاك الصلاحية.
- **`404 Not Found`**: المورد المطلوب غير موجود.
- **`409 Conflict`**: تكرار تقديم طلب أو مراجعة لنفس البرنامج.
- **`429 Too Many Requests`**: تجاوز الحد الأقصى لمعدل الطلبات (`Rate Limit Exceeded`).
- **`500 Internal Server Error`**: خطأ غير متوقع في الخادم مع إخفاء الـ Stack Trace في الإنتاج.
