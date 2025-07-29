import { NavLink } from 'react-router-dom';
import { useEffect, useState, type ReactElement } from 'react';
import clsx from 'clsx';
import TableChartIcon from '@mui/icons-material/TableChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';

interface MenuItem {
    id: string;
    label: string;
    icon: ReactElement;
    to?: string;
    children?: { label: string; to?: string }[];
}

interface MenuGroup {
    title: string;
    items: MenuItem[];
}

const MENU: MenuGroup[] = [
    {
        title: 'Core',
        items: [
            {
                id: 'models',
                label: 'Models',
                icon: <TableChartIcon fontSize="small" />,
                to: '/models',
            },
            {
                id: 'rules',
                label: 'Rules',
                icon: <AssignmentIcon fontSize="small" />,
                to: '/rules',
            },
            {
                id: 'workflows',
                label: 'Workflows',
                icon: <BarChartIcon fontSize="small" />,
                to: '/workflows',
            },
            {
                id: 'users',
                label: 'Users',
                icon: <PeopleIcon fontSize="small" />,
                to: '/users',
            },
        ],
    },
];

interface Props {
    open: boolean;
    onClose?: () => void;
}

export function Sidebar({ open, onClose }: Props) {
    const [collapsed, setCollapsed] = useState(() =>
        localStorage.getItem('sidebar-collapsed') === 'true'
    );
    const [selected, setSelected] = useState(() =>
        localStorage.getItem('sidebar-selected') || ''
    );

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', collapsed.toString());
    }, [collapsed]);

    useEffect(() => {
        localStorage.setItem('sidebar-selected', selected);
    }, [selected]);

    const toggle = (id: string) => setSelected(selected === id ? '' : id);

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
                <nav className="flex flex-1 flex-col text-sm">
                    {MENU.map((group) => (
                        <div key={group.title} className="mb-6">
                            <h3 className="mb-4 text-xs uppercase leading-5 text-gray-400">
                                <span className={clsx(collapsed && 'xl:hidden')}>{group.title}</span>
                            </h3>
                            <ul className="flex flex-col gap-1">
                                {group.items.map((item) => (
                                    <li key={item.id}>
                                        {item.children ? (
                                            <>
                                                <button
                                                    className={clsx(
                                                        'group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800',
                                                        selected === item.id && 'bg-indigo-100 dark:bg-gray-800'
                                                    )}
                                                    onClick={() => toggle(item.id)}
                                                >
                                                    {item.icon}
                                                    <span className={clsx(collapsed && 'hidden xl:inline')}>{item.label}</span>
                                                    <ExpandMoreIcon
                                                        fontSize="small"
                                                        className={clsx(
                                                            'ml-auto transition-transform',
                                                            selected === item.id && 'rotate-180',
                                                            collapsed && 'xl:hidden'
                                                        )}
                                                    />
                                                </button>
                                                <ul
                                                    className={clsx(
                                                        'mt-2 flex flex-col gap-1 pl-9',
                                                        selected === item.id ? 'block' : 'hidden',
                                                        collapsed && 'xl:hidden'
                                                    )}
                                                >
                                                    {item.children.map((child) => (
                                                        <li key={child.label}>
                                                            <NavLink
                                                                to={child.to || '#'}
                                                                onClick={onClose}
                                                                className="block rounded px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                                            >
                                                                {child.label}
                                                            </NavLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        ) : (
                                            <NavLink
                                                to={item.to || '#'}
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    clsx(
                                                        'flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100',
                                                        isActive && 'bg-indigo-500 text-white'
                                                    )
                                                }
                                            >
                                                {item.icon}
                                                <span className={clsx(collapsed && 'hidden xl:inline')}>{item.label}</span>
                                            </NavLink>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
