# Zein Hub — Professional Media Training Platform

منصة تدريب إعلامي احترافي موجهة لشباب وصنّاع المحتوى في صعيد مصر.

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Code Quality:** ESLint

## 📁 Project Structure

```text
zein-hub/
│
├── public/
│   ├── images/
│   │   ├── logo/
│   │   ├── hero/
│   │   ├── programs/
│   │   ├── instructors/
│   │   └── testimonials/
│   ├── icons/
│   └── fonts/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── programs/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── about/page.tsx
│   │   ├── instructors/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── home/
│   │   ├── programs/
│   │   ├── instructors/
│   │   └── ui/
│   │
│   ├── data/
│   │   ├── programs.ts
│   │   ├── instructors.ts
│   │   └── testimonials.ts
│   │
│   ├── lib/
│   │   ├── constants.ts
│   │   └── utils.ts
│   │
│   └── types/
│       ├── program.ts
│       └── instructor.ts
│
├── .env.local
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 3. Production Build
```bash
npm run build
npm start
```
