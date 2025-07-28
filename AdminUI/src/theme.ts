import { DefaultTheme, createGlobalStyle, keyframes } from 'styled-components';

export const lightTheme: DefaultTheme = {
    colors: {
        background: '#f5f5f5',
        text: '#222222',
        primary: '#6b46ff',
        primaryLight: '#7b61ff',
        accent: '#ff6b6b',
        secondary: '#4f46e5',
        border: '#d1d5db',
        success: '#16a34a',
        warning: '#f59e0b',
        info: '#0ea5e9',
    },
    spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '4rem',
    },
    radius: '4px',
    shadows: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.15)',
    },
    transitions: {
        fast: '0.2s',
        normal: '0.3s',
    },
    maxWidth: '1200px',
    fontSizes: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
    },
    fonts: {
        body: "'Inter', sans-serif",
        heading: "'Inter', sans-serif",
    },
};

export const darkTheme: DefaultTheme = {
    colors: {
        background: '#1a1a1a',
        text: '#ffffff',
        primary: '#7b61ff',
        primaryLight: '#9176ff',
        accent: '#ff8787',
        secondary: '#6366f1',
        border: '#374151',
        success: '#16a34a',
        warning: '#f59e0b',
        info: '#0284c7',
    },
    spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '4rem',
    },
    radius: '4px',
    shadows: {
        sm: '0 1px 2px rgba(0,0,0,0.4)',
        md: '0 4px 6px rgba(0,0,0,0.5)',
        lg: '0 10px 15px rgba(0,0,0,0.6)',
    },
    transitions: {
        fast: '0.2s',
        normal: '0.3s',
    },
    maxWidth: '1200px',
    fontSizes: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
    },
    fonts: {
        body: "'Inter', sans-serif",
        heading: "'Inter', sans-serif",
    },
};

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
  }
  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    min-height: 100vh;
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primaryLight};
      outline-offset: 2px;
    }
  }

  input,
  button,
  select,
  textarea {
    font-family: ${({ theme }) => theme.fonts.body};
    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primaryLight};
      outline-offset: 2px;
    }
  }
`;
