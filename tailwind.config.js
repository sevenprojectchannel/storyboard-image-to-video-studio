/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#090a0f',
          panel: '#10121a',
          card: '#151824',
          cardHover: '#1c2030',
          border: '#22283a',
          borderHover: '#333c56',
          accent: '#6366f1',
          accentHover: '#4f46e5',
          gold: '#f59e0b',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-accent': '0 0 20px -5px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.35)',
        'glow-gold': '0 0 20px -5px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
