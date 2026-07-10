import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      colors: {
        ink: "#090a0f",
        panel: "rgba(18, 22, 33, 0.74)",
        line: "rgba(255, 255, 255, 0.10)",
        mint: "#48e5b4",
        coral: "#ff7a70",
        skyglass: "#8bd4ff"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(72, 229, 180, 0.14)",
        panel: "0 20px 60px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: [forms]
} satisfies Config;
