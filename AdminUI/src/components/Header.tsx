import { useTheme } from '../theme';

export function Header() {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-neutral-700">
            <h1 className="text-lg font-semibold">AdminUI</h1>
            <div className="flex items-center gap-3">
                <button onClick={toggleTheme} className="px-2 py-1 rounded bg-gray-200 dark:bg-neutral-700">
                    {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-400" />
            </div>
        </header>
    );
}
