import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
        setDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, []);

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
