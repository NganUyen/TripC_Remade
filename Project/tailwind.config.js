/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				'primary-hover': '#E54810',
				'primary-dark': '#D13C08',
				'background-light': '#f6f7f8',
				'background-dark': '#0f172a',
				'charcoal': '#181310',
				'border-subtle': '#e7deda',
				'price-green': '#10B981',
				'sage': {
					DEFAULT: '#8ecab4',
					700: '#4a7a67', // Approximate darker shade for text
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			fontFamily: {
				'display': [
					'var(--font-plus-jakarta)',
					'sans-serif'
				]
			},
			borderRadius: {
				'card': '2rem',
				'pill': '9999px',
				'DEFAULT': '0.5rem',
				'lg': '1rem',
				'xl': '1.5rem',
				'2xl': '2rem',
				'3xl': '2.5rem',
				'full': '9999px',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
				subtle: '0 2px 8px rgba(0,0,0,0.05)',
				glow: '0 0 15px rgba(255, 94, 31, 0.3)',
				depth: '0 20px 40px -5px rgba(0, 0, 0, 0.1)'
			},
			animation: {
				'fade-in-up': 'fadeInUp 0.5s ease-out forwards'
			},
			keyframes: {
				fadeInUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				fadeIn: {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
				slideUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}