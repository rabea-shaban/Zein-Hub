import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Official Brand Palette — Primary Gold #F0D070
        gold: {
          50: "#FEFDF8",
          100: "#FDF9EE",
          200: "#FAF0D6",
          300: "#F7E5B5",
          400: "#F4DB93",
          500: "#F0D070", // Official Primary Gold
          600: "#D6B552",
          700: "#B29237",
          800: "#8B7026",
          900: "#6E561C",
        },
        brand: {
          50: "#FEFDF8",
          100: "#FDF9EE",
          200: "#FAF0D6",
          300: "#F7E5B5",
          400: "#F4DB93",
          500: "#F0D070", // Official Primary Accent Gold
          600: "#D6B552",
          700: "#B29237",
          800: "#8B7026",
          900: "#6E561C",
        },
        // Official Brand Palette — Primary Blue #0F1D4A
        navy: {
          50: "#F7F8FC", // Neutral Light BG
          100: "#E8EBF2", // Soft Gray
          200: "#C8D1E3",
          300: "#98A8C7",
          400: "#667085", // Medium Gray
          500: "#334E85",
          600: "#20386E",
          700: "#172A5E",
          800: "#132352",
          850: "#111F4E",
          900: "#0F1D4A", // Official Primary Blue
          950: "#091230", // Deep Shade Blue
        },
        // Supporting status colors
        success: "#22A06B",
        error: "#D64545",
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "var(--font-cairo)", "system-ui", "sans-serif"],
      },
      lineHeight: {
        relaxed: "1.9",
        loose: "2.1",
        heading: "1.35",
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(240, 208, 112, 0.40)',
        'navy-card': '0 10px 30px -10px rgba(15, 29, 74, 0.25)',
      }
    },
  },
  plugins: [],
};

export default config;
