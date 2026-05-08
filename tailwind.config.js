/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eff4ff',
          100: '#dbe8fe',
          200: '#bfd3fe',
          300: '#93b4fd',
          400: '#6090fa',
          500: '#3b6ef6',
          600: '#254feb',
          700: '#1d3fd8',
          800: '#1e3a8a',
          900: '#1e3370',
          950: '#161f4a',
        },
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0d9488',
          600: '#0f766e',
          700: '#0f5f5a',
          800: '#134e4a',
          900: '#134240',
          950: '#042f2e',
        },
      },
      fontFamily: {
        // San Francisco on Apple, Segoe UI on Windows, system-ui everywhere else
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        // Merriweather for question text and rationale — warm, readable serif
        serif: ['"Merriweather"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      animation: {
        'flip-in':  'flipIn 0.35s ease-in-out',
        'flip-out': 'flipOut 0.35s ease-in-out',
        'fade-in':  'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow':'spin 1.4s linear infinite',
      },
      keyframes: {
        flipIn:  { '0%': { transform: 'rotateY(90deg)',  opacity: '0' }, '100%': { transform: 'rotateY(0)',    opacity: '1' } },
        flipOut: { '0%': { transform: 'rotateY(0)',      opacity: '1' }, '100%': { transform: 'rotateY(-90deg)',opacity: '0' } },
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
