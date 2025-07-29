import type { FC } from 'react';
import { Button } from './common/Button';
import { SearchBar } from './SearchBar';

interface Props {
    onMenuClick: () => void;
}

export const Header: FC<Props> = ({ onMenuClick }) => (
    <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-indigo-200 bg-white px-4 shadow-sm dark:bg-gray-800">
        <button
            className="mr-2 hidden text-lg max-md:block"
            aria-label="Open menu"
            onClick={onMenuClick}
        >
            ☰
        </button>
        <h1 className="text-lg font-semibold">AdminUI</h1>
        <div className="mx-4 flex-1 max-w-xs">
            <SearchBar />
        </div>
        <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => document.documentElement.classList.toggle('dark')}>
                Toggle Theme
            </Button>
            <div className="h-8 w-8 rounded-full bg-gray-400" role="img" aria-label="User avatar" />
        </div>
    </header>
);
