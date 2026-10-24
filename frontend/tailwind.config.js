/** Paleta da identidade Bolsa360 (prancha de marca) */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#FFC107", dark: "#E0A800", soft: "#FFF4CC" },
        ink: "#111111",
        mute: "#6B6B6B",
        line: "#E5E5E5",
      },
      fontFamily: { sans: ["Poppins", "system-ui", "sans-serif"] },
      keyframes: {
        rise: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      animation: { rise: "rise .5s cubic-bezier(.2,.7,.2,1) both", fade: "fade .3s ease both" },
    },
  },
  plugins: [],
};
