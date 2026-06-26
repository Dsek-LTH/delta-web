module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        // step-end creates the sharp on/off terminal effect
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};
