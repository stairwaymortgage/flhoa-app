import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#003366", dark: "#00264D", light: "#1B5299" },
        gold: { DEFAULT: "#C9A227", light: "#F3E9CE" },
        ink: "#1A2733",
        mut: "#5B6B7A",
        line: "#D5DDE5",
        paper: "#F4F6F9",
        ok: "#1E7A46",
        warn: "#B7791F",
      },
      fontFamily: {
        serif: ["var(--font-merriweather)", "Georgia", "serif"],
        sans: ["var(--font-public-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      maxWidth: { content: "1100px" },
    },
  },
  plugins: [],
};
export default config;
