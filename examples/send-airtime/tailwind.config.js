/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
  	extend: {
      colors: {
        purple: {
          900: '#4C1D95',
        },
        indigo: {
          900: '#312E81',
          600: '#4F46E5',
          500: '#6366F1',
        },
      },
    },
    backgroundSize: {
      'auto': 'auto',
      'cover': 'cover',
      'contain': 'contain',
      '50%': '120%',
      '16': '4rem',
    }
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
    require("tailwindcss-animate")
  ]
}