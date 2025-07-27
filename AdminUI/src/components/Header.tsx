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
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary-500">Your CMS Admin</h1>
            <button onClick={toggle} className="btn btn-secondary">
                {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
        </header>
    );
}
