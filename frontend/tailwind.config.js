/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0f19',
        card: 'rgba(30, 41, 59, 0.7)',
        border: '#334155',
        gold: '#f59e0b',
        emerald: { 500: '#10b981' },
        rose: { 500: '#ef4444' }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
