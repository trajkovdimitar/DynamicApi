import { NavLink } from 'react-router-dom';

export function Sidebar() {
    return (
        <aside className="w-16 md:w-48 bg-gray-200 dark:bg-neutral-800 h-full flex flex-col">
            <nav className="flex-1 p-2 space-y-2">
                <NavLink className="block p-2 rounded hover:bg-gray-300 dark:hover:bg-neutral-700" to="/">Dashboard</NavLink>
                <NavLink className="block p-2 rounded hover:bg-gray-300 dark:hover:bg-neutral-700" to="/models">Models</NavLink>
                <NavLink className="block p-2 rounded hover:bg-gray-300 dark:hover:bg-neutral-700" to="/rules">Rules</NavLink>
                <NavLink className="block p-2 rounded hover:bg-gray-300 dark:hover:bg-neutral-700" to="/workflows">Workflows</NavLink>
                <NavLink className="block p-2 rounded hover:bg-gray-300 dark:hover:bg-neutral-700" to="/workflow-dashboard">Workflow Studio</NavLink>
            </nav>
        </aside>
    );
}
