import { DefaultTheme, createGlobalStyle } from 'styled-components';

export const lightTheme: DefaultTheme = {
    colors: {
        background: '#f5f5f5',
        text: '#222222',
        primary: '#6b46ff',
        primaryLight: '#7b61ff',
        accent: '#ff6b6b',
        secondary: '#4f46e5',
        border: '#d1d5db',
    },
    spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '4rem',
    },
    radius: '4px',
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
    },
    spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '4rem',
    },
    radius: '4px',
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
  body {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.body};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  input,
  button,
  select,
  textarea {
    font-family: ${({ theme }) => theme.fonts.body};
  }
`;
