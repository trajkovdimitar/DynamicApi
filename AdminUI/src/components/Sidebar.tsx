import { useState } from 'react';
import { NavLink } from 'react-router-dom';
interface Props {
    collapsible?: boolean;
}

export function Sidebar({ collapsible = false }: Props) {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <aside
            className={`bg-neutral-800 dark:bg-neutral-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex-shrink-0`}
        >
            {collapsible && (
                <button onClick={() => setCollapsed(!collapsed)} className="p-4">
                    Toggle
                </button>
            )}
            <nav className="p-4">
                <ul>
                    <li className="py-2 hover:bg-neutral-700 rounded">
                        <NavLink to="/">Dashboard</NavLink>
                    </li>
                    <li className="py-2 hover:bg-neutral-700 rounded">
                        <NavLink to="/models">Models</NavLink>
                    </li>
                    <li className="py-2 hover:bg-neutral-700 rounded">
                        <NavLink to="/rules">Rules</NavLink>
                    </li>
                    <li className="py-2 hover:bg-neutral-700 rounded">
                        <NavLink to="/workflows">Workflows</NavLink>
                    </li>
                    <li className="py-2 hover:bg-neutral-700 rounded">
                        <NavLink to="/workflow-dashboard">Workflow Studio</NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}
