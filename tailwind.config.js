// Adicione na configuração do Tailwind
module.exports = {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			inter: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui'
  			],
  			poppins: [
  				'Poppins',
  				'ui-sans-serif',
  				'system-ui'
  			],
  			nunito: [
  				'Nunito Sans',
  				'ui-sans-serif',
  				'system-ui'
  			],
  			source: [
  				'Source Sans Pro',
  				'ui-sans-serif',
  				'system-ui'
  			],
  			sans: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui'
  			]
  		},
  		colors: {
  			ipimGreen: '#009683',
  			ipimGreenHover: '#04584E',
  			ipimBgSectionNextStep: '#F8F8F8',
  			ipimBgLightFooter: '#FBFBFB',
  			ipimTitleFooter: '#54595F',
  			ipimTextFooter: '#7A7A7A',
  			ipimHoverIconFooter: '#7A7A7A',
  			ipimIndigoLight: '#6759EB',
  			ipimWhiteSnowforButton: '#f3f8ff',
  			ipimIndigoDark: '#5546e9',
  			ipimBlack: '#231F20',
  			ipimWhiteSnow: '#F4F9FF',
  			ipimBlueberry: '#304070',
  			ipimIndigoTextHover: '#5e7fe4',
  			ipimSessionIndigo: '#1b1642',
  			ipimWhiteSnowTwo: '#E9ECEF',
  			ipimYellow: '#f5c170',
  			ipimSnowButton: '#f3f8ff',
  			ipimSnowButtonHover: '#e1e5f6',
  			ipimSessionBlueIndigo: '#f3f8ff',
  			ipimGray: '#e9ecef',
  			ipimBgDark: '#09090b',
  			ipimBorderDark: '#27272a',
  			ipimTextDark: '#a1a1aa',
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
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	},
  	screens: {
  		ultrawide: '3440px',
  		desktop4k: '2560px',
  		desktop: '2000px',
  		laptopLg: '1920px',
  		laptopMd: '1100px',
  		tablet: '768px',
  		phone: '320px'
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
