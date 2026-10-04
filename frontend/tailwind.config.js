/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0B1020',
        surface: '#111832',
        raised: '#182042',
        line: '#232C4D',
        'line-strong': '#36426F',
        ink: '#EAEEFB',
        muted: '#98A2C3',
        faint: '#7883AB',
        accent: { DEFAULT: '#7B8CFF', strong: '#5B6DFF', soft: '#7B8CFF1A' },
        mint: '#5EE0A8',
        amber: '#F5B84B',
        sky: '#5EC3FF',
        rose: '#FF7A90',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(255 255 255 / 0.03) inset, 0 8px 24px -12px rgb(0 0 0 / 0.5)',
        lift: '0 1px 0 0 rgb(255 255 255 / 0.05) inset, 0 18px 40px -16px rgb(91 109 255 / 0.35)',
        pop: '0 24px 60px -20px rgb(0 0 0 / 0.7)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(40px,-24px,0) scale(1.08)' },
        },
        pulseDot: {
          '0%': { boxShadow: '0 0 0 0 rgb(94 224 168 / 0.5)' },
          '100%': { boxShadow: '0 0 0 8px rgb(94 224 168 / 0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        drift: 'drift 18s ease-in-out infinite',
        'drift-slow': 'drift 26s ease-in-out infinite reverse',
        'pulse-dot': 'pulseDot 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}
