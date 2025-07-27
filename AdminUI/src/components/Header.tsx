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
        <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Your CMS Admin</h1>
            <button
                onClick={toggle}
                className="btn bg-white text-primary-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
                {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
        </header>
    );
}
