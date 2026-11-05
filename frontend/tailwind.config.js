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
        groww: {
          green: '#00D09C',
          greenHover: '#00B386',
          greenLight: '#E6FBF5',
          red: '#EB5B3C',
          redLight: '#FDF2E9',
          dark: '#121212',
          cardDark: '#1E222D',
          cardDarker: '#161920',
          borderDark: '#2A2E39',
          textDark: '#E0E3EB',
          mutedDark: '#848E9C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
