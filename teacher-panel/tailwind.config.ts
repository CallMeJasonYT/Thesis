import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: "var(--color-tertiary)",
        quaternary: "var(--color-quaternary)",
        neutral: "var(--color-neutral)",
        light: "var(--color-light)",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        dark: "var(--color-dark)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      maxWidth: {
        xl: "var(--breakpoint-xl)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          "--color-primary": process.env.NEXT_PUBLIC_PRIMARY_COLOR!,
          "--color-secondary": process.env.NEXT_PUBLIC_SECONDARY_COLOR!,
          "--color-tertiary": process.env.NEXT_PUBLIC_TERTIARY_COLOR!,
          "--color-quaternary": process.env.NEXT_PUBLIC_QUATERNARY_COLOR!,
          "--color-neutral": process.env.NEXT_PUBLIC_NEUTRAL_COLOR!,
          "--color-light": process.env.NEXT_PUBLIC_LIGHT_COLOR!,
          "--color-muted": process.env.NEXT_PUBLIC_MUTED_COLOR!,
          "--color-dark": process.env.NEXT_PUBLIC_DARK_COLOR!,
          "--breakpoint-xl": process.env.NEXT_PUBLIC_BREAKPOINT_XL!,
        },
      });
    }),
    require("tailwindcss-animate"),
  ],
};
export default config;
