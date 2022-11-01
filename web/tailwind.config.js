/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        default: '#f1f1f1',
        paper: '#f5f5f5',
        offset: '#778DA9',
        primary: '#FF570A',
        secondary: '#381D2A',
      },
      screens: {
        smo: { max: '425px' },
      },
    },
  },
  plugins: [],
};
