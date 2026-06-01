/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#05060a",
          800: "#0a0c14",
          700: "#10131f",
          600: "#161a2b",
        },
        accent: {
          DEFAULT: "#6d8bff",
          glow: "#8aa2ff",
          soft: "#a9b6ff",
        },
        teal: "#3fd9c8",
        violet: "#b388ff",
      },
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        // SectionFX colour orbs (keyframes defined in index.css)
        "fx-drift-a": "fx-drift-a 16s ease-in-out infinite",
        "fx-drift-b": "fx-drift-b 20s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
