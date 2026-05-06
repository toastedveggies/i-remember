import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F8F4EE",
          surface: "#FFFDF9",
          text: "#1F2529",
          muted: "#4B5560",
          primary: "#355B5A",
          compass: "#A44A3F",
          highlight: "#D8A35D",
          support: "#E8EFE8",
          border: "#D9D6D0"
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
