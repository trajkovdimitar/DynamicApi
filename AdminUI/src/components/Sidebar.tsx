import { NavLink } from 'react-router-dom';
import { useEffect, useState, type ReactElement } from 'react';
import clsx from 'clsx';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ChatIcon from '@mui/icons-material/Chat';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import WidgetsIcon from '@mui/icons-material/Widgets';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
        title: 'Menu',
        items: [
            {
                id: 'Dashboard',
                label: 'Dashboard',
                icon: <DashboardIcon fontSize="small" />,
                children: [
                    { label: 'eCommerce' },
                    { label: 'Analytics' },
                    { label: 'Marketing' },
                    { label: 'CRM' },
                    { label: 'Stocks' },
                    { label: 'SaaS' },
                    { label: 'Logistics' },
                ],
            },
            {
                id: 'AI',
                label: 'AI Assistant',
                icon: <SmartToyIcon fontSize="small" />,
                children: [
                    { label: 'Text Generator' },
                    { label: 'Image Generator' },
                    { label: 'Code Generator' },
                    { label: 'Video Generator' },
                ],
            },
            {
                id: 'Ecommerce',
                label: 'E-commerce',
                icon: <ShoppingCartIcon fontSize="small" />,
                children: [
                    { label: 'Products' },
                    { label: 'Add Product' },
                    { label: 'Billing' },
                    { label: 'Invoices' },
                ],
            },
            {
                id: 'Calendar',
                label: 'Calendar',
                icon: <CalendarTodayIcon fontSize="small" />,
                to: '#',
            },
            {
                id: 'Profile',
                label: 'User Profile',
                icon: <PersonOutlineIcon fontSize="small" />,
                to: '#',
            },
            {
                id: 'Task',
                label: 'Task',
                icon: <AssignmentIcon fontSize="small" />,
                children: [
                    { label: 'List' },
                    { label: 'Kanban' },
                ],
            },
            {
                id: 'Forms',
                label: 'Forms',
                icon: <DescriptionIcon fontSize="small" />,
                children: [
                    { label: 'Form Elements' },
                    { label: 'Form Layout' },
                ],
            },
            {
                id: 'Tables',
                label: 'Tables',
                icon: <TableChartIcon fontSize="small" />,
                children: [
                    { label: 'Basic Tables' },
                    { label: 'Data Tables' },
                ],
            },
            {
                id: 'Pages',
                label: 'Pages',
                icon: <InsertDriveFileIcon fontSize="small" />,
                children: [
                    { label: 'File Manager' },
                    { label: 'Pricing Tables' },
                    { label: 'Faq' },
                    { label: 'API Keys' },
                    { label: 'Integrations' },
                    { label: 'Blank Page' },
                    { label: '404 Error' },
                    { label: '500 Error' },
                    { label: '503 Error' },
                    { label: 'Coming Soon' },
                    { label: 'Maintenance' },
                    { label: 'Success' },
                ],
            },
        ],
    },
    {
        title: 'Support',
        items: [
            {
                id: 'Chat',
                label: 'Chat',
                icon: <ChatIcon fontSize="small" />,
                to: '#',
            },
            {
                id: 'Support',
                label: 'Support Ticket',
                icon: <SupportAgentIcon fontSize="small" />,
                children: [
                    { label: 'Ticket List' },
                    { label: 'Ticket Reply' },
                ],
            },
            {
                id: 'Email',
                label: 'Email',
                icon: <MailOutlineIcon fontSize="small" />,
                children: [
                    { label: 'Inbox' },
                    { label: 'Details' },
                ],
            },
        ],
    },
    {
        title: 'Others',
        items: [
            {
                id: 'Charts',
                label: 'Charts',
                icon: <BarChartIcon fontSize="small" />,
                children: [
                    { label: 'Line Chart' },
                    { label: 'Bar Chart' },
                    { label: 'Pie Chart' },
                ],
            },
            {
                id: 'UiElements',
                label: 'UI Elements',
                icon: <WidgetsIcon fontSize="small" />,
                children: [
                    { label: 'Alerts' },
                    { label: 'Avatars' },
                    { label: 'Badge' },
                ],
            },
            {
                id: 'Authentication',
                label: 'Authentication',
                icon: <LockOutlinedIcon fontSize="small" />,
                children: [
                    { label: 'Sign In' },
                    { label: 'Sign Up' },
                    { label: 'Reset Password' },
                    { label: 'Two Step Verification' },
                ],
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
