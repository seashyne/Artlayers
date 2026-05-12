/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b10",
        panel: "#11141b",
        panel2: "#171b24",
        line: "#252b36",
        accent: "#7dd3fc"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(0, 0, 0, 0.34)"
      }
    }
  },
  plugins: []
};
