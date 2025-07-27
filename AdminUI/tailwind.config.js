/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    light: '#818CF8',
                    DEFAULT: '#4F46E5',
                    dark: '#4338CA',
                },
                accent: {
                    light: '#2DD4BF',
                    DEFAULT: '#14B8A6',
                    dark: '#0F766E',
                },
                neutral: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
            },
            boxShadow: {
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            borderRadius: {
                lg: '0.5rem',
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        h1: { color: theme('colors.primary.DEFAULT') },
                        a: { color: theme('colors.accent.DEFAULT'), textDecoration: 'underline' },
                    },
                },
            }),
        },
    },
    plugins: [forms, typography],
};
