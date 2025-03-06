import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        quaternary: "var(--color-quaternary)",
        neutral: "var(--color-neutral)",
        light: "var(--color-light)",
        muted: "var(--color-muted)",
        dark: "var(--color-dark)",
      },
      maxWidth: {
        xl: "var(--breakpoint-xl)",
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
  ],
};
export default config;
