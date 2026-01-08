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
        "primary": "#ff5e1f",
        "primary-dark": "#e54610",
        "background-light": "#f8f6f5",
        "background-dark": "#23150f",
        "slate-custom": "#f1f5f9",
        "earth-amber": "#d97706",
        "earth-terracotta": "#c2410c",
        "earth-olive": "#65a30d",
        "rose-gold": "#C57E88",
        "gold": "#FFC107",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"],
        "sans": ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "2xl": "1.25rem",
        "full": "9999px"
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 94, 31, 0.4)',
        'glow-hover': '0 0 20px rgba(255, 94, 31, 0.6)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'earth-glow': '0 4px 20px -5px rgba(180, 83, 9, 0.5)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
      },
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'heart-burst': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'heart-burst': 'heart-burst 0.3s ease-in-out',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
