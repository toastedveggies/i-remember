import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        calm: {
          bg: "#f5f8fb",
          card: "#ffffff",
          text: "#1f2937",
          muted: "#6b7280",
          border: "#dbe3ec",
          accent: "#2563eb"
        }
      }
    }
  },
  plugins: []
};

export default config;
