import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        ntt: {
          red: '#C0272D',
          'red-dark': '#8B1A1E',
          'red-light': '#FDF5F5',
          gold: '#D4A017',
          'gold-light': '#FDFBF0',
          green: '#2E7D32',
          'green-light': '#F5F9F5',
          bg: '#F7F4F0',
        },
      },
      backgroundImage: {
        'ntt-gradient': 'linear-gradient(135deg, #FDF5F5 0%, #F5F9F5 45%, #FDFBF0 100%)',
      },
    },
  },
  plugins: [],
}

export default config