import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppLayout } from "@/components/layout/AppLayout";
import { SITE_CONFIG } from "@/lib/constants";

export const viewport: Viewport = {
  themeColor: "#0F1D4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Zein Hub",
    "من الصعيد بنصنع إعلام المستقبل",
    "تدريب إعلامي",
    "التعليق الصوتي والفوكاليز",
    "صعيد مصر",
    "بودكاست",
    "تقديم تلفزيوني",
    "صحافة الذكاء الاصطناعي",
    "إعلام أسيوط سوهاج قنا الأقصر أسوان المنيا",
    "From Upper Egypt We Create the Media of Tomorrow",
    "Professional Media Training Platform",
  ],
  authors: [{ name: "Zein Hub Platform" }],
  creator: "Zein Hub",
  publisher: "Zein Hub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: SITE_CONFIG.url,
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('zein_hub_theme');
                  var isDark = stored ? stored === 'dark' : true;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col antialiased bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 selection:bg-gold-500 selection:text-navy-950 transition-colors duration-300"
        suppressHydrationWarning
      >
        <AppProviders>
          <AppLayout>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}
