import { createContext, useEffect, useState } from 'react';

interface ThemeContextValue {
    isDark: boolean;
    toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
    isDark: false,
    toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState<boolean>(() => {
        const stored = localStorage.getItem('isDark');
        if (stored !== null) {
            return stored === 'true';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('isDark', String(isDark));
    }, [isDark]);

    const toggle = () => setIsDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}
