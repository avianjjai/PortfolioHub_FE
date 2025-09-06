/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#6366f1',
          pink: '#ec4899',
          blue: '#3b82f6',
          orange: '#f97316',
          green: '#10b981',
        },
        dark: {
          purple: '#4c1d95',
          blue: '#1e3a8a',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-purple-pink': 'linear-gradient(135deg, #6366f1, #ec4899)',
        'gradient-orange-pink': 'linear-gradient(135deg, #f97316, #ec4899)',
        'gradient-blue-purple': 'linear-gradient(135deg, #3b82f6, #6366f1)',
        'gradient-orange-yellow': 'linear-gradient(135deg, #f97316, #fbbf24)',
        'gradient-pink-orange': 'linear-gradient(135deg, #ec4899, #f97316)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 