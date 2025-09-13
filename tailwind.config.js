// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // LivReplenish Color Palette - Serene wellness colors
      colors: {
        // Primary wellness greens
        wellness: {
          50: '#f0f9f3',
          100: '#dcf2e3',
          200: '#bbe5ca',
          300: '#8dd1a7',
          400: '#5bb57d',
          500: '#369b5c',
          600: '#297d49',
          700: '#22643c',
          800: '#1f5032',
          900: '#1a422b',
          950: '#0d2516',
        },
        // Calming blues
        serenity: {
          50: '#eff8ff',
          100: '#daf0ff',
          200: '#bee6ff',
          300: '#91d6ff',
          400: '#5cbdff',
          500: '#349dff',
          600: '#1d7ef5',
          700: '#1665e1',
          800: '#1952b6',
          900: '#1a478f',
          950: '#142c57',
        },
        // Warm earth tones
        earth: {
          50: '#faf9f7',
          100: '#f2f0eb',
          200: '#e6e1d7',
          300: '#d4ccba',
          400: '#beb298',
          500: '#a99a7c',
          600: '#968871',
          700: '#7c6f5f',
          800: '#675c51',
          900: '#544c44',
          950: '#2c2622',
        },
        // Soft accent colors
        accent: {
          lavender: '#e6e6fa',
          sage: '#9caf88',
          cream: '#f5f5dc',
          pearl: '#f8f6f0',
          mist: '#f0f4f8',
        },
        // Status colors optimized for wellness app
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      
      // Typography for wellness content
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'ui-serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      
      // Spacing optimized for mobile-first wellness app
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Animation for smooth wellness interactions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'ripple': 'ripple 0.6s linear',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      
      // Shadows for depth and wellness aesthetic
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'wellness': '0 4px 25px -2px rgba(54, 155, 92, 0.1), 0 10px 20px -2px rgba(54, 155, 92, 0.04)',
        'serenity': '0 4px 25px -2px rgba(52, 157, 255, 0.1), 0 10px 20px -2px rgba(52, 157, 255, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      
      // Border radius for modern wellness design
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Screen sizes optimized for responsive design
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // Typography scale for wellness content
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      // Backdrop blur effects
      backdropBlur: {
        'xs': '2px',
      },
      
      // Grid template columns for wellness layout
      gridTemplateColumns: {
        'ritual': 'repeat(auto-fit, minmax(280px, 1fr))',
        'dashboard': '1fr 300px',
        'mobile-nav': '1fr auto',
      },
      
      // Transition timing functions
      transitionTimingFunction: {
        'bounce-gentle': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-wellness': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      
      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1010',
        'fixed': '1020',
        'modal-backdrop': '1030',
        'modal': '1040',
        'popover': '1050',
        'tooltip': '1060',
        'notification': '1070',
      },
    },
  },
  
  plugins: [
    // Add custom plugin for wellness-specific utilities
    function({ addUtilities, addComponents, theme }) {
      // Wellness-specific component styles
      addComponents({
        '.ritual-card': {
          '@apply bg-white rounded-2xl shadow-soft border border-wellness-100 transition-all duration-300 hover:shadow-wellness hover:border-wellness-200': {},
        },
        '.btn-wellness': {
          '@apply bg-wellness-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-wellness-600 active:scale-95 focus:ring-2 focus:ring-wellness-300 focus:ring-offset-2': {},
        },
        '.btn-serenity': {
          '@apply bg-serenity-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-serenity-600 active:scale-95 focus:ring-2 focus:ring-serenity-300 focus:ring-offset-2': {},
        },
        '.btn-outline-wellness': {
          '@apply border-2 border-wellness-500 text-wellness-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-wellness-50 active:scale-95 focus:ring-2 focus:ring-wellness-300 focus:ring-offset-2': {},
        },
        '.input-wellness': {
          '@apply w-full px-4 py-3 border border-wellness-200 rounded-xl focus:ring-2 focus:ring-wellness-300 focus:border-wellness-400 transition-colors duration-200 bg-white placeholder-wellness-400': {},
        },
        '.progress-bar': {
          '@apply w-full bg-wellness-100 rounded-full h-2 overflow-hidden': {},
        },
        '.progress-fill': {
          '@apply h-full bg-gradient-to-r from-wellness-500 to-wellness-400 rounded-full transition-all duration-500 ease-out': {},
        },
        '.vitality-score': {
          '@apply text-2xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent': {},
        },
      })
      
      // Custom utilities
      addUtilities({
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `${theme('colors.wellness.300')} ${theme('colors.wellness.100')}`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.wellness.100'),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.wellness.300'),
            borderRadius: '3px',
            '&:hover': {
              background: theme('colors.wellness.400'),
            },
          },
        },
        '.glass-effect': {
          'backdrop-filter': 'blur(10px)',
          'background': 'rgba(255, 255, 255, 0.8)',
          'border': `1px solid rgba(255, 255, 255, 0.2)`,
        },
        '.glass-dark': {
          'backdrop-filter': 'blur(10px)',
          'background': 'rgba(0, 0, 0, 0.1)',
          'border': `1px solid rgba(255, 255, 255, 0.1)`,
        },
      })
    },
    
    // Additional plugins for better typography and forms
    require('@tailwindcss/typography')({
      className: 'prose-wellness',
    }),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
  
  // Safelist important classes that might be used dynamically
  safelist: [
    'animate-breathe',
    'animate-pulse-gentle',
    'text-wellness-500',
    'text-serenity-500',
    'bg-wellness-50',
    'bg-serenity-50',
    'border-wellness-200',
    'border-serenity-200',
    // Progress percentages
    ...Array.from({ length: 101 }, (_, i) => `w-[${i}%]`),
  ],
}