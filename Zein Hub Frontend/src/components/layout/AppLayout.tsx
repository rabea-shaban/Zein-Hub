'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardOrAuth =
    pathname.startsWith('/admin') ||
    pathname === '/instructor' ||
    pathname.startsWith('/instructor/') ||
    pathname === '/student' ||
    pathname.startsWith('/student/') ||
    pathname === '/login' ||
    pathname === '/register';

  if (isDashboardOrAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
