/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#080d19',
          900: '#0f172a',
          850: '#131e32',
          800: '#1e293b',
          700: '#334155',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          900: '#083344',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          950: '#022c22',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
          950: '#4c0519',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          950: '#2e1065',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(34, 211, 238, 0.3)',
        'glow-emerald': '0 0 20px -3px rgba(52, 211, 153, 0.3)',
        'glow-rose': '0 0 25px -2px rgba(244, 63, 94, 0.4)',
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'flow-line': 'flow 3s linear infinite',
      },
      keyframes: {
        flow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
