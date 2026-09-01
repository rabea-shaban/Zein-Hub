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
        // 🌟 Official Zein Hub Readability Gold Palette (#D4AF37)
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FFFDF2",
          100: "#FFF9D6",
          200: "#FFF1A8",
          300: "#FFD966", // Light / Hover Gold (#FFD966)
          400: "#E3C24B",
          500: "#D4AF37", // Primary Solid Readable Gold (#D4AF37)
          600: "#BD9A2C",
          700: "#A66A00", // Dark Gold Accent (#A66A00)
          800: "#875500",
          900: "#694100",
          950: "#452A00",
          light: "#FFD966",
          dark: "#A66A00",
        },
        brand: {
          DEFAULT: "#D4AF37",
          50: "#FFFDF2",
          100: "#FFF9D6",
          200: "#FFF1A8",
          300: "#FFD966",
          400: "#E3C24B",
          500: "#D4AF37",
          600: "#BD9A2C",
          700: "#A66A00",
          800: "#875500",
          900: "#694100",
          950: "#452A00",
          light: "#FFD966",
          dark: "#A66A00",
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
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.40)',
        'gold-card': '0 8px 30px -8px rgba(212, 175, 55, 0.20)',
        'navy-card': '0 10px 30px -10px rgba(15, 29, 74, 0.25)',
      }
    },
  },
  plugins: [],
};

export default config;
