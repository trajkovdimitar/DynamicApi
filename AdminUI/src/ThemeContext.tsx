import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
/* eslint-disable react-refresh/only-export-components */

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    toggleTheme: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null;
        setTheme(stored || 'light');
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!initialized) return;
        localStorage.setItem('theme', theme);
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
    }, [theme, initialized]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
