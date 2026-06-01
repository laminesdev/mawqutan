/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e27',
        surface: 'rgba(232, 224, 208, 0.05)',
        'surface-raised': '#111533',
        overlay: 'rgba(17, 21, 51, 0.95)',
        'text-primary': '#e8e0d0',
        'text-secondary': '#8b83a0',
        'text-muted': '#a098c0',
        'text-verse': '#6b6380',
        accent: {
          DEFAULT: '#d4a843',
          hover: '#c49430',
          glow: 'rgba(212, 168, 67, 0.4)',
        },
        border: 'rgba(232, 224, 208, 0.1)',
        placeholder: '#7a7390',
        'toast-bg': 'rgba(17, 21, 51, 0.95)',
      },
      fontFamily: {
        arabic: ['Noto Naskh Arabic', 'serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
        'float': 'particleFloat 5s linear infinite',
        'timer-bg': 'timerBgShift 10s ease-in-out infinite alternate',
        'ornament-pulse': 'ornamentPulse 2s ease-in-out infinite',
      },
      keyframes: {
        particleFloat: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '15%': { opacity: '0.8' },
          '70%': { opacity: '0.5' },
          '100%': { transform: 'translateY(-80px) translateX(20px)', opacity: '0' },
        },
        timerBgShift: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '100%': { transform: 'scale(1.05) rotate(2deg)' },
        },
        ornamentPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
