import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "Noto Sans Arabic", "Noto Sans", "sans-serif"],
      },
      
  colors: {
  brand: {
    50: "#fff1f6",
    100: "#ffe3ee",
    200: "#ffc2d9",
    300: "#ff94bd",
    400: "#ff63a1",
    500: "#ff3a8a",
    600: "#e61f73",
    700: "#b71659",
    800: "#8f1145",
    900: "#6f0e37",
  },
  teal: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },
},

      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.08)",
      },
    },
  },
  plugins: [],
};
export default config;
