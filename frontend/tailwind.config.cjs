/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
        accent: '#f97316',
        brand: '#10b981'
      },
      borderRadius: {
        xl: '20px'
      }
    },
  },
  plugins: [],
}
