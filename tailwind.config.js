/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#06060a',
          900: '#0b0b12',
          850: '#0f0f18',
          800: '#141423',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,.06), 0 0 48px rgba(124,58,237,.14)',
        card: '0 0 0 1px rgba(255,255,255,.07), 0 20px 60px rgba(0,0,0,.55)',
      },
      letterSpacing: {
        tighter2: '-0.04em',
      },
      fontFamily: {
        display: ['"Unbounded"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

