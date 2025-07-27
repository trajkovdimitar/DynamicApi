/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

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
                    light: '#7b61ff',
                    DEFAULT: '#6b46ff',
                    dark: '#5536e8',
                },
            },
        },
    },
    plugins: [forms],
};
