/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        "poppins-light": ["Poppins", "sans-serif"], // Weight 300
        "poppins-regular": ["Poppins", "sans-serif"], // Weight 400
        "poppins-medium": ["Poppins", "sans-serif"], // Weight 500
        "poppins-semibold": ["Poppins", "sans-serif"], // Weight 600
        poppinsBold: ["Poppins", "sans-serif"], // Weight 700
      },
      colors: {
        bgPrimary: "var(--color-bg-primary)",
        fgPrimary: "var(--color-fg-primary)",
        fgSecondary: "var(--color-fg-secondary)",
        fgThird: "var(--color-fg-third)",
        colorActive: "var(--color-active)",
        tBase: "var(--color-text-base)",
        tDarkBg: "var(--color-text-dark-bg)",
        tActive: "var(--color-text-active)",
        bBase: "var(--color-border-base)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}