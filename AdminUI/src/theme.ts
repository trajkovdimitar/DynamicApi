import { DefaultTheme } from 'styled-components';

const base = {
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px'
    },
    fontSizes: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem'
    }
};

export const lightTheme: DefaultTheme = {
    ...base,
    colors: {
        background: '#f5f5f5',
        text: '#1f2937',
        primary: '#6b46ff',
        primaryLight: '#7b61ff',
        primaryDark: '#5536e8',
        border: '#e5e7eb',
        secondary: '#ffffff'
    }
};

export const darkTheme: DefaultTheme = {
    ...base,
    colors: {
        background: '#111827',
        text: '#f9fafb',
        primary: '#6b46ff',
        primaryLight: '#7b61ff',
        primaryDark: '#5536e8',
        border: '#374151',
        secondary: '#1f2937'
    }
};
