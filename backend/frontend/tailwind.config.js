/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        secondary: '#e9d5ff',
        accent: '#a78bfa',
        surface: '#f9f5ff',
        textmain: '#2d1b4e',
        warmteal: '#7c3aed',
        softorange: '#e9d5ff',
        coral: '#a78bfa',
        cream: '#f9f5ff',
        deepbrown: '#2d1b4e',
      },
    },
  },
  plugins: [],
}
