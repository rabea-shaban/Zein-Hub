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
        // 🌟 Official Zein Hub 3D Metallic Gold Palette (Extracted from Logo)
        gold: {
          50: "#FFFDF0",
          100: "#FFF9D6",
          200: "#FFF0A3",
          300: "#FFE658", // Crystal Highlight Gold
          400: "#FEDB51", // Radiant Gold Glow
          500: "#FABF30", // Primary Official Metallic Gold (#FABF30)
          600: "#E5A823", // Deep Rich Gold
          700: "#D0880B", // Warm Amber Gold
          800: "#BC7602", // Deep Bronze Gold Shadow
          900: "#9F5B00", // Dark Accent Shadow
          950: "#612F00", // Extra Deep Shade
        },
        brand: {
          50: "#FFFDF0",
          100: "#FFF9D6",
          200: "#FFF0A3",
          300: "#FFE658",
          400: "#FEDB51",
          500: "#FABF30",
          600: "#E5A823",
          700: "#D0880B",
          800: "#BC7602",
          900: "#9F5B00",
          950: "#612F00",
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
        'gold-glow': '0 0 25px -5px rgba(250, 191, 48, 0.45)',
        'gold-card': '0 8px 30px -8px rgba(250, 191, 48, 0.25)',
        'navy-card': '0 10px 30px -10px rgba(15, 29, 74, 0.25)',
      }
    },
  },
  plugins: [],
};

export default config;
