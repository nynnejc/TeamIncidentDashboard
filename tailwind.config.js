/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["\"Danske Text\"", "system-ui", "sans-serif"],
        serif: ["\"Danske Text\"", "serif"],
      },
      colors: {
        ink: {
          strong: "#0a1a2a",
          muted: "#5a6b7d",
        },
        surface: {
          DEFAULT: "#fefefe",
          muted: "#f4f7fb",
        },
        accent: {
          DEFAULT: "#0b5a8a",
          light: "#dceeff",
        },
        border: "#d6dee8",
      },
      boxShadow: {
        soft: "0 20px 50px rgba(10, 25, 47, 0.08)",
        lift: "0 18px 30px rgba(10, 25, 47, 0.18)",
      },
      keyframes: {
        "panel-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "card-fade": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        panel: "panel-rise 0.45s ease both",
        card: "card-fade 0.35s ease both",
      },
    },
  },
  plugins: [],
}
