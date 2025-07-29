import type { FC } from 'react';
import { useState } from 'react';
import clsx from 'clsx';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ThemeToggleButton } from './common/ThemeToggleButton';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SearchBar } from './SearchBar';
import { useTheme } from '../ThemeContext';
import { useSidebar } from '../context/SidebarContext';

export const Header: FC = () => {
    // Subscribe to theme changes to re-render when toggled
    useTheme();
    const { toggleSidebar, toggleMobileSidebar } = useSidebar();
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleToggle = () => {
        if (window.innerWidth >= 1024) {
            toggleSidebar();
        } else {
            toggleMobileSidebar();
        }
    };

    return (
        <header
            className={clsx(
                'sticky top-0 z-50 flex w-full border-gray-200 bg-white',
                'xl:border-b dark:border-gray-800 dark:bg-gray-900'
            )}
        >
            <div className="flex grow flex-col items-center justify-between xl:flex-row xl:px-6">
                <div
                    className={clsx(
                        'flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3',
                        'sm:gap-4 lg:py-4 xl:justify-normal xl:border-b-0 xl:px-0 dark:border-gray-800'
                    )}
                >
                    <button
                        className={clsx(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            'border-gray-200 text-gray-500',
                            'xl:h-11 xl:w-11 xl:border dark:border-gray-800 dark:text-gray-400'
                        )}
                        aria-label="Toggle sidebar"
                        onClick={handleToggle}
                    >
                        <MenuIcon fontSize="small" />
                    </button>
                    <h1 className="text-lg font-semibold xl:hidden">AdminUI</h1>
                    <button
                        className={clsx(
                            'z-10 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700',
                            'hover:bg-gray-100 xl:hidden',
                            'dark:text-gray-400 dark:hover:bg-gray-800',
                            menuOpen && 'bg-gray-100 dark:bg-gray-800'
                        )}
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen(o => !o)}
                    >
                        <MoreVertIcon fontSize="small" />
                    </button>
                    <div className="hidden xl:block w-full max-w-sm">
                        <SearchBar />
                    </div>
                </div>
                <div
                    className={clsx(
                        menuOpen ? 'flex' : 'hidden',
                        'w-full items-center justify-between gap-4 px-5 py-4 xl:flex xl:justify-end xl:px-0'
                    )}
                >
                    <div className="flex items-center gap-2">
                        <ThemeToggleButton />
                        <div className="relative">
                            <button
                                onClick={() => setNotifyOpen(o => !o)}
                                aria-label="Notifications"
                                className={clsx(
                                    'hover:text-dark-900 relative flex h-11 w-11 items-center justify-center',
                                    'rounded-full',
                                    'border border-gray-200 bg-white text-gray-500 transition-colors',
                                    'hover:bg-gray-100 hover:text-gray-700',
                                    'dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400',
                                    'dark:hover:bg-gray-800 dark:hover:text-white'
                                )}
                            >
                                <NotificationsNoneIcon fontSize="small" />
                            </button>
                            {notifyOpen && (
                                <div
                                    className={clsx(
                                        'absolute right-0 mt-2 flex h-48 w-72 flex-col overflow-y-auto',
                                        'rounded-2xl',
                                        'border border-gray-200',
                                        'bg-white p-3 text-sm shadow-lg',
                                        'dark:border-gray-800 dark:bg-gray-900'
                                    )}
                                >
                                    <span className="text-gray-500 dark:text-gray-400">No notifications</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setUserOpen(o => !o)}
                            className="flex items-center text-gray-700 dark:text-gray-400"
                            aria-haspopup="true"
                        >
                            <span
                                className="mr-3 h-11 w-11 overflow-hidden rounded-full bg-gray-400"
                                role="img"
                                aria-label="User avatar"
                            />
                            <span className="text-sm mr-1 hidden font-medium md:block">User</span>
                            <ExpandMoreIcon
                                fontSize="small"
                                className={userOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
                            />
                        </button>
                        {userOpen && (
                            <div
                                className={clsx(
                                    'absolute right-0 mt-2 w-64 rounded-2xl',
                                    'border border-gray-200 bg-white p-3 shadow-lg',
                                    'dark:border-gray-800 dark:bg-gray-900'
                                )}
                            >
                                <button
                                    className={clsx(
                                        'group text-sm flex w-full items-center gap-3 rounded-lg px-3 py-2',
                                        'font-medium text-gray-700 hover:bg-gray-100',
                                        'dark:text-gray-400 dark:hover:bg-white/5'
                                    )}
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
