# 🚀 Zein Hub — Frontend Super Admin Dashboard Documentation

## 1. Overview & Architecture
The **Super Admin Dashboard** for Zein Hub Media LMS is built inside the Next.js 16 App Router frontend (`d:/Zein Hub/Zein Hub Frontend`), integrated natively with the Express + TypeScript backend (`http://localhost:5000/api/v1`) using **httpOnly Cookies** and **RBAC (Role-Based Access Control)**.

### Technology Stack:
- **Framework:** Next.js (App Router) + React 19
- **Styling:** Tailwind CSS + Custom Brand Tokens (Primary Navy `#0F1D4A` & Accent Gold `#F0D070`)
- **Icons:** `lucide-react`
- **State & Auth:** `AuthContext` + Universal `api` client (`credentials: 'include'`)

---

## 2. Directory Structure

```text
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx             # Protected Admin Shell with Sidebar & Header
│   │   ├── page.tsx               # Overview KPIs, Progress Tiers & Recent Applications
│   │   ├── programs/page.tsx      # Programs CRUD, status toggle & featured toggle
│   │   ├── tracks/page.tsx        # Specialization Tracks management
│   │   ├── instructors/page.tsx   # Instructors management & creation modal
│   │   ├── applications/page.tsx  # Admissions queue with review notes modal
│   │   ├── enrollments/page.tsx   # Active, completed, and dropped student records
│   │   ├── reviews/page.tsx       # Student reviews moderation & feature toggle
│   │   ├── analytics/page.tsx     # Deep-dive aggregation reports
│   │   ├── certificates/page.tsx  # Issued certificates & public verification
│   │   ├── live-sessions/page.tsx # Live workshop scheduling & status updates
│   │   └── attendance/page.tsx    # Attendance rate calculation & student logs
│   ├── login/page.tsx             # Universal auth login page
│   ├── layout.tsx                 # Root layout with Cairo font & AppProviders
│   └── globals.css                # Tailwind base, dark mode, and custom scrollbars
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx       # Responsive navigation with active route highlighting
│   │   ├── AdminHeader.tsx        # Profile pill, theme toggle & httpOnly logout
│   │   ├── StatCard.tsx           # Standardized metric KPI card
│   │   └── StatusBadge.tsx        # Dynamic color-coded status badges
│   └── providers/
│       └── AppProviders.tsx       # Theme, Language, and AuthProvider wrapper
├── context/
│   └── AuthContext.tsx            # Session verification via GET /auth/profile & login/logout
└── lib/
    └── api.ts                     # Standardized fetch wrapper (credentials: 'include')
```

---

## 3. Authentication & Security Flow

1. **httpOnly Cookies:**
   - On `POST /api/v1/auth/login`, the backend issues `zh_access_token` and `zh_refresh_token` as secure, httpOnly cookies.
   - The frontend `api` client uses `credentials: 'include'` for all requests, ensuring cookies are automatically sent and received without exposing tokens to `localStorage` or JavaScript.
2. **Role Verification:**
   - When accessing `/admin`, `AdminLayout` invokes `useAuth().checkAuth()`.
   - If the user's role is not `super_admin`, an interactive **403 Forbidden Access Denied** modal with a direct login redirect is displayed.
3. **Logout:**
   - Clicking Logout triggers `POST /api/v1/auth/logout`, which clears all authentication cookies on the backend and resets client state.

---

## 4. Admin Modules & Endpoint Matrix

| Module | Sub-Path | Backend Endpoint | Method | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Overview** | `/admin` | `/admin/dashboard/overview` | `GET` | Live KPIs, Progress Tiers, Quick Actions |
| **Admissions** | `/admin/applications` | `/applications` | `GET` | Queue (Pending, Accepted, Rejected) |
| **Review App** | Modal in `/admin` | `/applications/:id/review` | `PATCH` | Accept/Reject with custom notes |
| **Programs** | `/admin/programs` | `/programs` | `GET`, `POST` | Create Program, Filter, Search |
| **Program Status**| `/admin/programs` | `/programs/:id/status` | `PATCH` | Change to `open`, `coming-soon`, `closed` |
| **Featured** | `/admin/programs` | `/programs/:id/featured` | `PATCH` | Toggle Homepage Showcase |
| **Tracks** | `/admin/tracks` | `/tracks` | `GET`, `POST` | Specialization Tracks CRUD |
| **Instructors** | `/admin/instructors` | `/instructors/admin/all` | `GET`, `POST` | Create Instructor, Assign Programs |
| **Enrollments** | `/admin/enrollments` | `/enrollments` | `GET`, `PATCH` | Active, Completed, Dropped status |
| **Reviews** | `/admin/reviews` | `/reviews/admin/all` | `GET`, `PATCH` | Moderate (`approved`, `rejected`), Feature |
| **Analytics** | `/admin/analytics` | `/admin/analytics/*` | `GET` | Star breakdown, attendance & completion |
| **Certificates**| `/admin/certificates`| `/admin/analytics/certificates`| `GET` | Certificate logs & public verification |
| **Live Sessions**| `/admin/live-sessions`| `/programs/:id/sessions` | `GET`, `POST` | Schedule workshops, update status |
| **Attendance** | `/admin/attendance` | `/attendance/program/:id/summary` | `GET` | Attendance rates and student records |

---

## 5. Running and Testing the Application

### 1. Start the Backend:
```bash
cd "D:/Zein Hub Backend"
node dist/server.js
# Backend runs on http://localhost:5000/api/v1
```

### 2. Start the Frontend:
```bash
cd "D:/Zein Hub/Zein Hub Frontend"
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Log In as Super Admin:
- Navigate to: `http://localhost:3000/login`
- Email: `admin@zeinhub.com`
- Password: `Admin@ZeinHub2026!`
- Open `/admin` to view the live dashboard!
