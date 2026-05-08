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
        space: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4bffc',
          400: '#7b9ef8',
          500: '#5a7df3',
          600: '#3a5fe8',
          700: '#2d4dd4',
          800: '#2840aa',
          900: '#253986',
          950: '#1a2657',
        },
        cosmic: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#d975fa',
          500: '#c44df3',
          600: '#a72fd8',
          700: '#8c23b4',
          800: '#741f92',
          900: '#601d76',
          950: '#3f0852',
        },
        nebula: {
          900: '#0a0e1a',
          800: '#0d1220',
          700: '#111827',
          600: '#1a2340',
          500: '#1e2d5c',
          400: '#243270',
        },
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(135deg, #0a0e1a 0%, #0d1220 25%, #111827 50%, #1a2340 75%, #0a0e1a 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'glow-blue': 'radial-gradient(circle at center, rgba(90,125,243,0.3) 0%, transparent 70%)',
        'glow-purple': 'radial-gradient(circle at center, rgba(196,77,243,0.3) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'counter': 'counter 1s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(90,125,243,0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(90,125,243,0.8), 0 0 40px rgba(90,125,243,0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-blue': '0 0 20px rgba(90, 125, 243, 0.5)',
        'glow-purple': '0 0 20px rgba(196, 77, 243, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(90, 125, 243, 0.1)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
