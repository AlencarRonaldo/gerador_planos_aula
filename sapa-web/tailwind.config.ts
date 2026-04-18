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
          DEFAULT: '#F0F4FF',
          dark: '#E2EAFF',
        },
        stone: {
          DEFAULT: '#CBD5E1',
        },
        terra: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        bark: {
          DEFAULT: '#0F172A',
        },
        graphite: {
          DEFAULT: '#0F172A',
        },
        muted: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
        },
        sage: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
        },
        gold: {
          DEFAULT: '#EC4899',
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
