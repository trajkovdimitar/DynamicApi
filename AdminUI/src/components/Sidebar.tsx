import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import GavelIcon from '@mui/icons-material/Gavel';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import DataObjectIcon from '@mui/icons-material/DataObject';

interface Props {
    open: boolean;
    onClose?: () => void;
}

export function Sidebar({ open, onClose }: Props) {
    const [collapsed, setCollapsed] = useState(() =>
        localStorage.getItem('sidebar-collapsed') === 'true'
    );

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', collapsed.toString());
    }, [collapsed]);

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 xl:hidden"
                    onClick={onClose}
                />
            )}
            <aside
                className={clsx(
                    'fixed top-0 left-0 z-50 flex h-screen w-[290px] flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 transition-all duration-300 dark:border-gray-800 dark:bg-black xl:static',
                    open ? 'translate-x-0' : '-translate-x-full xl:translate-x-0',
                    collapsed ? 'xl:w-[90px]' : 'xl:w-[290px]'
                )}
            >
                <div className={clsx('flex items-center gap-2 pt-8 pb-7', collapsed ? 'justify-center' : 'justify-between')}>
                    <span className={clsx('text-xl font-semibold text-gray-900 dark:text-white', collapsed && 'hidden xl:block')}>AdminUI</span>
                    <button
                        className="xl:hidden"
                        aria-label="Close sidebar"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                    <button
                        className="hidden xl:block"
                        aria-label="Toggle sidebar"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? '›' : '‹'}
                    </button>
                </div>
                <nav className="flex flex-1 flex-col gap-1 text-sm">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200',
                                isActive && 'bg-indigo-500 text-white'
                            )
                        }
                        onClick={onClose}
                    >
                        <DashboardIcon fontSize="small" />
                        <span className={clsx(collapsed && 'hidden xl:inline')}>Dashboard</span>
                    </NavLink>
                    <NavLink
                        to="/models"
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200',
                                isActive && 'bg-indigo-500 text-white'
                            )
                        }
                        onClick={onClose}
                    >
                        <TableChartIcon fontSize="small" />
                        <span className={clsx(collapsed && 'hidden xl:inline')}>Models</span>
                    </NavLink>
                    <NavLink
                        to="/rules"
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200',
                                isActive && 'bg-indigo-500 text-white'
                            )
                        }
                        onClick={onClose}
                    >
                        <GavelIcon fontSize="small" />
                        <span className={clsx(collapsed && 'hidden xl:inline')}>Rules</span>
                    </NavLink>
                    <NavLink
                        to="/workflows"
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200',
                                isActive && 'bg-indigo-500 text-white'
                            )
                        }
                        onClick={onClose}
                    >
                        <WorkspacesIcon fontSize="small" />
                        <span className={clsx(collapsed && 'hidden xl:inline')}>Workflows</span>
                    </NavLink>
                    <NavLink
                        to="/workflow-dashboard"
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200',
                                isActive && 'bg-indigo-500 text-white'
                            )
                        }
                        onClick={onClose}
                    >
                        <DataObjectIcon fontSize="small" />
                        <span className={clsx(collapsed && 'hidden xl:inline')}>Workflow Studio</span>
                    </NavLink>
                </nav>
            </aside>
        </>
    );
}
