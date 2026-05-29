/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0D0D14',
        'ink-soft': '#12121A',
        'ink-muted': '#111217',
        glass: 'rgba(255,255,255,0.02)',
        border: 'rgba(255,255,255,0.06)',

        jade: '#00D68F',
        'jade-light': '#3AE89E',
        'jade-glow': 'rgba(0,214,143,0.08)',

        coral: '#FF6B6B',
        'coral-glow': 'rgba(255,107,107,0.08)',

        'amber-pxt': '#FFB347',
        'amber-glow': 'rgba(255,179,71,0.08)',

        'sky-pxt': '#4FC3F7',
        'sky-glow': 'rgba(79,195,247,0.06)',
      },
      fontFamily: {
        body: ["'DM Sans'", 'ui-sans-serif', 'system-ui'],
        display: ['Sora', 'ui-sans-serif', 'system-ui'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'SFMono-Regular'],
      },
      boxShadow: {
        'card-hover': '0 10px 30px rgba(0,0,0,0.4)',
        'glow-jade': '0 8px 40px rgba(0,214,143,0.12)',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 0px rgba(255,179,71,0.08)' },
          '50%': { boxShadow: '0 0 20px rgba(255,179,71,0.12)' },
          '100%': { boxShadow: '0 0 0px rgba(255,179,71,0.08)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.22s ease-out',
        'fade-in': 'fade-in 0.35s ease-out',
        'pulse-glow': 'pulse-glow 2.2s infinite',
      },
    },
  },
  plugins: [],
}

