import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        mob: { max: "767px" },
        tab: { min: "768px", max: "1023px" },
        mobtab: { max: "1023px" },
      },
      animation: {
        glow: "glowing 2s infinite",
      },
      keyframes: {
        glowing: {
          "0%": { boxShadow: "0 0 0 0 #3f94f7" },
          "50%": { boxShadow: "0 0 0 15px rgba(255, 71, 61, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255, 71, 61, 0)" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};

export default config;