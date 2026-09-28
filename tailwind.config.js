/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'oklch(var(--color-navy) / <alpha-value>)',
          hover: 'oklch(24% 0.15 260 / <alpha-value>)',
          light: 'oklch(92% 0.03 260 / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'oklch(var(--color-gold) / <alpha-value>)',
          hover: 'oklch(64% 0.18 85 / <alpha-value>)',
          light: 'oklch(95% 0.12 85 / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'oklch(var(--color-surface) / <alpha-value>)',
          muted: 'oklch(var(--color-surface-muted) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'oklch(var(--color-text) / <alpha-value>)',
          muted: 'oklch(var(--color-text-muted) / <alpha-value>)',
        },
        border: 'oklch(var(--color-border) / <alpha-value>)',
        focus: 'oklch(var(--color-gold) / <alpha-value>)',
        error: 'oklch(55% 0.22 25 / <alpha-value>)',
        success: 'oklch(55% 0.15 150 / <alpha-value>)',
        warning: 'oklch(70% 0.18 85 / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body: ['var(--font-lato)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['2rem', { lineHeight: '1.3' }],
        '4xl': ['2.5rem', { lineHeight: '1.2' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out-quart',
        'slide-down': 'slideDown 200ms ease-out-quart',
        'scale-in': 'scaleIn 150ms ease-out',
        'stagger-1': 'fadeIn 200ms ease-out 0ms both',
        'stagger-2': 'fadeIn 200ms ease-out 100ms both',
        'stagger-3': 'fadeIn 200ms ease-out 200ms both',
        'stagger-4': 'fadeIn 200ms ease-out 300ms both',
        'stagger-5': 'fadeIn 200ms ease-out 400ms both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};