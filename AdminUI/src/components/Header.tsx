import { useState } from 'react';

export function Header() {
    const [dark, setDark] = useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    const toggle = () => {
        const root = document.documentElement;
        if (dark) {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
        setDark(!dark);
    };

    return (
        <header className="h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-neutral-700">
            <h1 className="text-lg font-semibold">AdminUI</h1>
            <div className="flex items-center gap-3">
                <button onClick={toggle} className="px-2 py-1 rounded bg-gray-200 dark:bg-neutral-700">
                    {dark ? 'Light' : 'Dark'}
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-400" />
            </div>
        </header>
    );
}
