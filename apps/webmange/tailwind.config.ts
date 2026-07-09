import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#e8590c", fg: "#fff" }, // ลานกางเต็นท์ orange
        sidebar: { DEFAULT: "#1f2933", hover: "#323f4b", active: "#e8590c" },
      },
    },
  },
  plugins: [],
} satisfies Config;
