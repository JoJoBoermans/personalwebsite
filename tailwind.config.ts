import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          900: '#050816',
          850: '#0B1120'
        },
        accent: {
          500: '#3B82F6',
          600: '#2563EB'
        },
        violet: {
          500: '#8B5CF6'
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8'
        },
        border: 'rgba(255,255,255,0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,.25), 0 0 40px rgba(59,130,246,.10)',
        card: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.55)'
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(1200px circle at 20% 0%, rgba(59,130,246,0.20), transparent 55%), radial-gradient(900px circle at 90% 20%, rgba(139,92,246,0.18), transparent 50%)'
      }
    }
  },
  plugins: []
} satisfies Config;
