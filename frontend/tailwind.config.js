/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#03060f',
          900: '#060d1f',
          800: '#0a1428',
          700: '#0f1f3d',
          600: '#152a52',
        },
        electric: {
          500: '#2563eb',
          400: '#3b82f6',
          300: '#60a5fa',
          200: '#93c5fd',
          glow: '#1d4ed8',
        },
        cyan: {
          accent: '#06b6d4',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'count-up': 'countUp 0.8s ease forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 10px #2563eb44' }, '50%': { boxShadow: '0 0 30px #2563eb88' } },
      },
    },
  },
  plugins: [],
}
