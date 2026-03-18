import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF0F6",
          100: "#FFD6E8",
          200: "#FFB3D5",
          300: "#FF8CC1",
          400: "#F45E9B",
          500: "#C2185B",
          600: "#A0144D",
          700: "#7F103E",
          800: "#5F0B2E",
          900: "#3F071E",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#0E0E12",
        },
      },
      fontFamily: {
        serif: ["\"Playfair Display\"", "Georgia", "serif"],
        sans: ["\"Manrope\"", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(194, 24, 91, 0.15)",
        glass: "0 10px 40px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(1200px 600px at 0% 0%, rgba(194, 24, 91, 0.25), transparent 60%)",
        "rose-dawn":
          "linear-gradient(120deg, rgba(255, 240, 246, 0.95), rgba(255, 255, 255, 0.8) 45%, rgba(255, 214, 232, 0.8))",
      },
    },
  },
  plugins: [],
};

export default config;
