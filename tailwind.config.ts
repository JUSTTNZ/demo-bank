import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',     // blue-600
        secondary: '#1E293B',   // slate-800
        accent: '#38BDF8',      // sky-400
        light: '#F1F5F9',       // gray-100
        dark: '#0F172A',        // slate-900
        error: '#EF4444',       // red-500
      },
      fontFamily: {
        inter: ['var(--font-inter)'], // if you're using @next/font
        poppins: ['Poppins', 'sans-serif'], // if added via Google Fonts
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        glass: '20px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
      },
      backdropBlur: {
        glass: '8px',
      },
    },
  },
  plugins: [],
}

export default config;