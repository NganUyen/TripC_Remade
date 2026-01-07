/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#FF5E1F",
        "primary-hover": "#E54810",
        "primary-dark": "#D13C08",
        "background-light": "#f6f7f8",
        "background-dark": "#0f172a",
      },
      fontFamily: {
        "display": ["var(--font-plus-jakarta)", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'subtle': '0 2px 8px rgba(0,0,0,0.05)',
        'glow': '0 0 15px rgba(255, 94, 31, 0.3)',
      }
    },
  },
  plugins: [],
}
