import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Green — trust, operations, logistics, growth
        primary: {
          50: '#ecfdf3',
          100: '#d1fae1',
          200: '#a6f4c5',
          300: '#6ee7a1',
          400: '#34d37a',
          500: '#0fb85a',
          600: '#0B6B3A', // brand primary
          700: '#095c31',
          800: '#0b4928',
          900: '#093d22',
          950: '#042211',
        },
        // Neutral Gray — professional, industrial
        neutral: {
          50: '#f8f8f8',
          100: '#f0f0f1',
          200: '#e4e4e5',
          300: '#d1d1d3',
          400: '#a9a9ab',
          500: '#8a8a8d',
          600: '#6D6E71', // brand secondary
          700: '#5a5a5d',
          800: '#4a4a4d',
          900: '#3d3d40',
          950: '#262628',
        },
        // Accent Yellow — CTAs, active indicators, status highlights
        accent: {
          50: '#fffbeb',
          100: '#fff3c6',
          200: '#ffe588',
          300: '#ffd34a',
          400: '#FFC107', // brand accent
          500: '#f0a800',
          600: '#d48800',
          700: '#a86200',
          800: '#8a4d08',
          900: '#72400c',
          950: '#432101',
        },
        // Semantic colors
        success: {
          50: '#ecfdf3',
          100: '#d1fae1',
          200: '#a6f4c5',
          300: '#6ee7a1',
          400: '#34d37a',
          500: '#0fb85a',
          600: '#059940',
          700: '#047a35',
          800: '#06602b',
          900: '#064f25',
          950: '#022c14',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Surface & background
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8f8f8',
          tertiary: '#f0f0f1',
          elevated: '#ffffff',
          overlay: 'rgba(0, 0, 0, 0.5)',
        },
        // Dark mode surfaces
        dark: {
          DEFAULT: '#0f1117',
          card: '#181b22',
          elevated: '#1f222b',
          border: '#2a2d37',
          muted: '#353842',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Display
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        // Headings
        'h1': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h3': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        // Body
        'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Small/Caption
        'small': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
        // Labels
        'label': ['0.8125rem', { lineHeight: '1', fontWeight: '600' }],
        'label-sm': ['0.75rem', { lineHeight: '1', fontWeight: '600' }],
        // Numeric / KPI
        'kpi': ['2rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'kpi-lg': ['2.5rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'kpi-sm': ['1.5rem', { lineHeight: '1', letterSpacing: '-0.015em', fontWeight: '700' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 2px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'lg': '0 10px 20px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'nav': '0 1px 3px rgba(0,0,0,0.05)',
        'elevated': '0 8px 30px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'counter': 'counter 2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};

export default config;
