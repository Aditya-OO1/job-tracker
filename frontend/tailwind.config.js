/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0F',
          soft: '#16161F',
          muted: '#1E1E2A',
        },
        slate: {
          light: '#8B8BA0',
          DEFAULT: '#5C5C7A',
        },
        accent: {
          DEFAULT: '#7C6FFF',
          bright: '#9B91FF',
          dim: '#4A3FBF',
        },
        success: '#22D3A5',
        warning: '#F59E0B',
        danger: '#F87171',
        border: 'rgba(255,255,255,0.07)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
