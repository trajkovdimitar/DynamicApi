import { DefaultTheme, createGlobalStyle } from 'styled-components';

export const lightTheme: DefaultTheme = {
    colors: {
        background: '#f5f5f5',
        text: '#222222',
        primary: '#6b46ff',
        primaryLight: '#7b61ff',
    },
    spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
    },
};

export const darkTheme: DefaultTheme = {
    colors: {
        background: '#1a1a1a',
        text: '#ffffff',
        primary: '#7b61ff',
        primaryLight: '#9176ff',
    },
    spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
    },
};

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;
