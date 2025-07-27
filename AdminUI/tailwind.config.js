/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#7b61ff',
                    DEFAULT: '#6b46ff',
                    dark: '#5536e8',
                },
                secondary: {
                    light: '#e2e8f0',
                    DEFAULT: '#cbd5e1',
                    dark: '#94a3b8',
                },
            },
        },
    },
    plugins: [forms],
};
