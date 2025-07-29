import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
/* eslint-disable react-refresh/only-export-components */

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
        const root = document.documentElement;
        if (dark) root.classList.add('dark');
        else root.classList.remove('dark');
    }, [dark]);

    const toggle = () => setDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ dark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}
