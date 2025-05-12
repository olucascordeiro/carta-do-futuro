/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#111111',
          light: '#1a1a1a',
        },
        primary: {
          DEFAULT: '#A12339',
          light: '#B33A4E',
          dark: '#8C1C30',
        },
        secondary: {
          DEFAULT: '#B86C7C',
          light: '#C78997',
          dark: '#9A5A69',
        },
        accent: {
          gold: '#FFD8A8',
          lavender: '#C2B5D9',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#CCCCCC',
          muted: '#999999',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 216, 168, 0.3)',
        'glow-primary': '0 0 15px rgba(161, 35, 57, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};