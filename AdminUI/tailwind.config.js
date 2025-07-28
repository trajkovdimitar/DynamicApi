/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    100: '#f6ecfc',
                    200: '#e0c1f4',
                    500: '#ac73e6',
                    600: '#9736e8',
                    700: '#8312d1',
                },
                neutral: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    500: '#6b7280',
                    700: '#374151',
                    900: '#111827',
                },
                success: '#22c55e',
                warning: '#eab308',
                error: '#ef4444',
            },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [forms, typography],
};
