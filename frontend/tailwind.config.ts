import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFC72C",
          "yellow-dark": "#E5B026",
          navy: "#0A1F44",
          "navy-2": "#142B5C",
          blue: "#1F4ED8",
          "blue-dark": "#1740B8",
        },
        ink: {
          900: "#0B1220",
          700: "#2A3447",
          500: "#5B6679",
          400: "#7E8898",
          300: "#A9B1BD",
        },
        line: "#E6E8EE",
        "line-2": "#EFF1F5",
        page: "#F6F7FA",
        "page-soft": "#FAFBFD",
      },
      borderRadius: {
        ihsm: "6px",
        ih: "10px",
        ihlg: "14px",
        ihxl: "18px",
      },
      boxShadow: {
        ihsm: "0 1px 2px rgba(11,18,32,.04), 0 1px 1px rgba(11,18,32,.03)",
        ih: "0 2px 6px rgba(11,18,32,.06), 0 1px 2px rgba(11,18,32,.04)",
        ihlg: "0 12px 32px rgba(11,18,32,.10), 0 2px 6px rgba(11,18,32,.04)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono-raw)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
