import type { FC } from 'react';
import { useState } from 'react';
import clsx from 'clsx';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SearchBar } from './SearchBar';
import { useTheme } from '../ThemeContext';

interface Props {
    onMenuClick: () => void;
}

export const Header: FC<Props> = ({ onMenuClick }) => {
    const { dark, toggle } = useTheme();
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    return (
        <header
            className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-2 shadow-sm
                dark:border-gray-700 dark:bg-gray-800"
        >
            <div className="flex items-center justify-between gap-2">
                <button
                    className="text-gray-700 xl:hidden"
                    aria-label="Open menu"
                    onClick={onMenuClick}
                >
                    <MenuIcon />
                </button>
                <h1 className="text-lg font-semibold">AdminUI</h1>
                <div className="mx-4 hidden flex-1 max-w-sm xl:block">
                    <SearchBar />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggle}
                        aria-label="Toggle theme"
                        className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setNotifyOpen(o => !o)}
                            aria-label="Notifications"
                            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <NotificationsNoneIcon fontSize="small" />
                        </button>
                        {notifyOpen && (
                            <div
                                className={clsx(
                                    'absolute right-0 mt-2 w-56 rounded border border-gray-200 bg-white p-3 text-sm',
                                    'shadow-lg',
                                    'dark:border-gray-700 dark:bg-gray-900'
                                )}
                            >
                                No notifications
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setUserOpen(o => !o)}
                            className="flex items-center gap-1 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-haspopup="true"
                        >
                            <div className="h-8 w-8 rounded-full bg-gray-400" role="img" aria-label="User avatar" />
                            <ExpandMoreIcon
                                fontSize="small"
                                className={userOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
                            />
                        </button>
                        {userOpen && (
                            <div
                                className={clsx(
                                    'absolute right-0 mt-2 w-48 rounded border border-gray-200 bg-white py-2 shadow-lg',
                                    'dark:border-gray-700 dark:bg-gray-900'
                                )}
                            >
                                <button
                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100
                                        dark:hover:bg-gray-700"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
