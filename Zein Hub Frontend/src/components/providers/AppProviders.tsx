"use client";

import * as React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "react-hot-toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0F1D4A',
                color: '#FFFFFF',
                border: '1px solid rgba(240, 208, 112, 0.4)',
                borderRadius: '16px',
                padding: '12px 18px',
                fontSize: '13px',
                fontFamily: 'var(--font-cairo), Cairo, sans-serif',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#0F1D4A',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#0F1D4A',
                },
              },
            }}
          />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
