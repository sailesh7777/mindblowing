// Tailwind Play CDN configuration — shared across every page.
// Load this AFTER the tailwind CDN script but BEFORE any DOM usage of
// custom colour/font tokens.
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "nexora-bg": "#050B14",
        "nexora-deep": "#02122C",
        accent: "hsl(215 100% 60%)",
        "accent-foreground": "hsl(0 0% 100%)",
        highlight: "hsl(267 90% 67%)",
        "highlight-foreground": "hsl(0 0% 100%)",
        primary: {
          DEFAULT: "hsl(232 65% 16%)",
          foreground: "hsl(220 35% 97%)",
        },
        background: "hsl(228 33% 97%)",
        foreground: "hsl(232 45% 10%)",
        muted: {
          DEFAULT: "hsl(230 22% 95%)",
          foreground: "hsl(232 18% 42%)",
        },
        border: "hsl(230 22% 88%)",
      },
      fontFamily: {
        sans: ['"DM Sans"', "Inter", "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', '"DM Sans"', "sans-serif"],
        brand: ["Orbitron", '"Space Grotesk"', "sans-serif"],
      },
      boxShadow: {
        glow:
          "0 0 24px hsl(215 100% 60% / 0.35), 0 0 56px hsl(267 90% 67% / 0.28)",
      },
    },
  },
};
