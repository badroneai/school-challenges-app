
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 1. Color System (Lock-in)
        brand: {
          primary: '#4f46e5',   // indigo-600
          'primary-dark': '#4338ca', // indigo-700
          'primary-light': '#eef2ff', // indigo-50
          secondary: '#0d9488', // teal-600
          'secondary-light': '#f0fdfa', // teal-50
        },
        functional: {
          success: '#10b981', // emerald-500
          warning: '#f59e0b', // amber-500
          danger: '#f43f5e',  // rose-500
          neutral: '#64748b', // slate-500
        }
      },
      fontFamily: {
        'sans': ['Tajawal', 'sans-serif'],
      },
      borderRadius: {
        // 3. Radius (Lock-in)
        'ui-component': '0.75rem', // xl
        'ui-container': '2rem',    // 32px - Soft Modern Look
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(1rem)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    }
  },
  plugins: [],
}
