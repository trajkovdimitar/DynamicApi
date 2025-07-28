import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
/* eslint-disable react-refresh/only-export-components */
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, GlobalStyle } from './theme';

interface ThemeContextValue {
    dark: boolean;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    dark: false,
    toggle: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('dark');
        if (stored !== null) {
            setDark(stored === 'true');
        } else {
            setDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('dark', String(dark));
    }, [dark]);

    const toggle = () => setDark(prev => !prev);
    const theme = dark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ dark, toggle }}>
            <ThemeProvider theme={theme}>
                <GlobalStyle />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}
