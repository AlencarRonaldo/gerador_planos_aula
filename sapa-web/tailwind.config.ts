import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF8F3',
          dark: '#F2EEE6',
        },
        stone: {
          DEFAULT: '#E8E0D4',
        },
        terra: {
          DEFAULT: '#C4622D',
          light: '#E07A4A',
          dark: '#9C4A1F',
        },
        bark: {
          DEFAULT: '#3D2B1F',
        },
        graphite: {
          DEFAULT: '#1C1917',
        },
        muted: {
          DEFAULT: '#8C7B70',
          light: '#B5A89A',
        },
        sage: {
          DEFAULT: '#5A7A5A',
          light: '#7EA87E',
        },
        gold: {
          DEFAULT: '#C89B3C',
        }
      },
      borderRadius: {
        'card': '20px',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
