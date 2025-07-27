import { NavLink } from 'react-router-dom';

export function Sidebar() {
    return (
        <aside className="w-20 md:w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col">
            <nav className="flex-1 space-y-2">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive
                            ? 'block px-4 py-2 rounded-xl bg-primary-500 text-white'
                            : 'block px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/models"
                    className={({ isActive }) =>
                        isActive
                            ? 'block px-4 py-2 rounded-xl bg-primary-500 text-white'
                            : 'block px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                >
                    Models
                </NavLink>
                <NavLink
                    to="/rules"
                    className={({ isActive }) =>
                        isActive
                            ? 'block px-4 py-2 rounded-xl bg-primary-500 text-white'
                            : 'block px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                >
                    Rules
                </NavLink>
                <NavLink
                    to="/workflows"
                    className={({ isActive }) =>
                        isActive
                            ? 'block px-4 py-2 rounded-xl bg-primary-500 text-white'
                            : 'block px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                >
                    Workflows
                </NavLink>
                <NavLink
                    to="/workflow-dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? 'block px-4 py-2 rounded-xl bg-primary-500 text-white'
                            : 'block px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                >
                    Workflow Studio
                </NavLink>
            </nav>
        </aside>
    );
}
