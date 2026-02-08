import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'radio-amber': '#FF8C00',
        'radio-orange': '#FF6B35',
        'radio-blue': '#1E3A8A',
        'radio-black': '#0A0A0A',
        'radio-gray': '#1F2937',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'display': ['Orbitron', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typewriter': 'typewriter 0.5s steps(40) forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 140, 0, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 140, 0, 0.8), 0 0 30px rgba(255, 140, 0, 0.4)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config
