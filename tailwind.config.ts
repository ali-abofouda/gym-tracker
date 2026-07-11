import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#131417",
        surface: "#1b1d22",
        raised: "#212328",
        line: "#2c2f36",
        text: "#ECEDEE",
        muted: "#8A8F98",
        accent: "#E5484D",
        "accent-dim": "#4a1e20",
        gold: "#D9A441",
        ok: "#3FB27F"
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        oswald: ["var(--font-oswald)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
