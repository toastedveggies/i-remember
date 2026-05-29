import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Lora", "Georgia", "serif"],
      },
      colors: {
        brand: {
          bg: "#F6F3EE",
          surface: "#FFFDF9",
          text: "#5A4A3A",
          muted: "#8B7D6B",
          primary: "#355B5A",
          compass: "#A44A3F",
          highlight: "#D8A35D",
          support: "#E8EFE8",
          border: "#E3DAC9",
          sage: "#C8E2C4",
          sageDark: "#7C9B78",
          warm: "#EBE3D5",
          warmDark: "#8B7355"
        },
        // Back-compat tokens (existing class names used during earlier prototype passes).
        calm: {
          bg: "#F8F4EE",
          card: "#FFFDF9",
          text: "#1F2529",
          muted: "#4B5560",
          border: "#D9D6D0",
          accent: "#355B5A",
          accentSoft: "#D8A35D",
          support: "#E8EFE8"
        }
      }
    }
  },
  plugins: []
};

export default config;
