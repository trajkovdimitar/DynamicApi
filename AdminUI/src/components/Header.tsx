import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export function Header() {
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return (
                localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches)
            );
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    const toggle = () => setDark(!dark);

    return (
        <header className="sticky top-0 bg-white dark:bg-neutral-800 shadow-md p-4 flex items-center justify-between z-10">
            <div className="relative flex-1 max-w-md">
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary" />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            </div>
            <button onClick={toggle} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
                {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
        </header>
    );
}
