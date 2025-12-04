/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mist-green': '#D8E6D8', // Light beige green mist
        'mist-yellow': '#F2E6D8', // Light flaxen yellow
        'module-green': '#E0E8E0', // Tender grass green
        'module-yellow': '#EFE8D0', // Light wheat yellow
        'cinematic-white': '#F0F0F0',
        'cinematic-shadow': 'rgba(60, 50, 40, 0.3)',
      },
      fontFamily: {
        'cinematic': ['"Source Han Serif"', '"Noto Serif SC"', 'serif'],
        'sans': ['"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'module': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'text': '1px 1px 2px rgba(60, 50, 40, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
