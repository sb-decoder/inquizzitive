/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        gradient: {
          purple: "#667eea",
          "purple-dark": "#764ba2",
          pink: "#f093fb",
          red: "#f5576c",
          blue: "#4facfe",
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        slideInUp: "slideInUp 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(30px, -30px) rotate(120deg)" },
          "66%": { transform: "translate(-20px, 20px) rotate(240deg)" },
        },
        slideInUp: {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
