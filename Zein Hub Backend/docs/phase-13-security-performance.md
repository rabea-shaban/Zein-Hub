# Zein Hub Backend — Phase 13: Security / Performance / Production Hardening

توثيق شامل لطبقة التحصين الأمني، تقييد المعدل (`Rate Limiting`)، التعقيم والتطهير ضد (`NoSQL Injection` و `XSS`)، ترويسات الأمان (`HTTP Security Headers`)، ضغط الاستجابات (`Response Compression`)، والسجلات الآمنة (`Production Logging`) لمنصة **Zein Hub Media LMS**.

---

## 1. محاور التحصين الأمني والإنتاجي (Hardening Features)

1. **تقييد المعدل ومكافحة القوة الغاشمة (Rate Limiting & Anti-Abuse)**:
   - **التقييد العام (Global Rate Limiter)**: 300 طلب لكل IP كل 15 دقيقة عبر مسارات `/api/*`.
   - **تقييد المصادقة (Auth Rate Limiter)**: 20 محاولة لكل IP كل 15 دقيقة لمسارات `/auth/login` و `/auth/register` و `/auth/refresh-token` لمنع الـ Brute-Force و Credential Stuffing.
   - **تقييد العمليات الحساسة (Sensitive Actions)**: 30 طلب لكل 5 دقائق.
   - استجابة معيارية موحدة برمز `429 Too Many Requests` مع ترويسات معايير IETF (`RateLimit-Limit`, `RateLimit-Remaining`).
2. **التعقيم والتطهير الشامل (Sanitization & Injection Defense)**:
   - **مكافحة NoSQL Injection**: تطهير تكراري لجميع كائنات `req.body`, `req.params`, `req.query` من أي مفاتيح تحتوي على مشغلات MongoDB مثل `$ne`, `$gt`, `$regex`, `$where` أو النقاط `.` لمنع التلاعب بالشروط.
   - **مكافحة XSS و HTML Injection**: تعقيم النصوص وإزالة وسوم `<script>` وروابط `javascript:` ومعالجات الأحداث `on*=` مع الحفاظ على النصوص الطبيعية.
3. **ترويسات أمان HTTP المحصنة (Security Headers via Helmet & Custom Middleware)**:
   - `X-Content-Type-Options: nosniff` (منع تخمين نوع المحتوى).
   - `X-Frame-Options: DENY` (منع هجمات الـ Clickjacking).
   - `X-XSS-Protection: 1; mode=block`.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - إزالة ترويسة `X-Powered-By` لإخفاء تقنية الخادم.
4. **تحسين الأداء وضغط الاستجابات (Response Compression & Performance)**:
   - تفعيل `compression` لجميع استجابات JSON التي تتجاوز 1 كيلوبايت (`threshold: 1024`).
   - استعلامات معتمدة على الفهارس المركبة (`Compound Indexes`) وتجميعات MongoDB الفعالة.
5. **نظام السجلات الآمن للإنتاج (Production Logging & Error Sanitization)**:
   - إخفاء وتشفير الحقول الحساسة (`password`, `token`, `authorization`, `secret`) تلقائياً من السجلات (`[REDACTED]`).
   - معالج أخطاء مركزي موحد يخفي الـ Stack Traces وأسماء الـ Collections وبيانات الاتصال في بيئة الإنتاج (`NODE_ENV=production`).
6. **فحص الجاهزية والتشغيل (Health Check & Graceful Shutdown)**:
   - نقطتي فحص `/health` و `/api/v1/health` تعيد حالة الخادم وقاعدة البيانات دون كشف أسرار داخلية.
   - دعم الإغلاق الآمن (`Graceful Shutdown`) عند إشارات `SIGTERM` و `SIGINT`.
