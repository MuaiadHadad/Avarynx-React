import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#88ccff',
          600: '#0ea5e9',
          700: '#0284c7',
          900: '#0c4a6e',
        },
        secondary: {
          500: '#cc77ff',
          600: '#a855f7',
        },
        dark: {
          bg: '#202020',
          panel: 'rgba(32,32,32,0.98)',
          border: 'rgba(136,204,255,0.6)',
        },
      },
      fontFamily: {
        sans: ['FiraSansCondensed', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #88ccff' },
          '100%': { boxShadow: '0 0 20px #88ccff, 0 0 30px #88ccff' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
