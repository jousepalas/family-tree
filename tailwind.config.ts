// tailwind.config.ts
// Ensure this is the exact content of your file
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: "class", // Correct dark mode strategy
  content: [
    // Using the specific paths generated earlier
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Map semantic color names directly to CSS variables
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // Main background
        foreground: "hsl(var(--foreground))", // Main text
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          // Using HSL values consistent with shadcn defaults
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(0 0% 98%)",
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
          // Use specific variables if defined, otherwise fallback to card/background
          DEFAULT: "hsl(var(--popover, var(--card, var(--background))))",
          foreground: "hsl(var(--popover-foreground, var(--card-foreground, var(--foreground))))",
        },
        card: {
          // Use specific variables if defined, otherwise fallback to background
          DEFAULT: "hsl(var(--card, var(--background)))",
          foreground: "hsl(var(--card-foreground, var(--foreground)))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Keep for now, disable if issues persist
    require("tailwindcss-animate")
  ],
};
export default config;