import { NavLink } from 'react-router-dom';
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
    return (
        <div
            className="hidden md:block md:w-48"
            aria-hidden={!open}
        >
            <aside className="fixed inset-y-0 left-0 flex w-48 flex-col bg-indigo-50 dark:bg-gray-800">
                <nav className="flex flex-1 flex-col gap-2 p-2 text-sm">
                    <NavLink
                        to="/"
                        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200 [&.active]:bg-indigo-500 [&.active]:text-white"
                        onClick={onClose}
                    >
                        <DashboardIcon fontSize="small" /> Dashboard
                    </NavLink>
                    <NavLink
                        to="/models"
                        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200 [&.active]:bg-indigo-500 [&.active]:text-white"
                        onClick={onClose}
                    >
                        <TableChartIcon fontSize="small" /> Models
                    </NavLink>
                    <NavLink
                        to="/rules"
                        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200 [&.active]:bg-indigo-500 [&.active]:text-white"
                        onClick={onClose}
                    >
                        <GavelIcon fontSize="small" /> Rules
                    </NavLink>
                    <NavLink
                        to="/workflows"
                        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200 [&.active]:bg-indigo-500 [&.active]:text-white"
                        onClick={onClose}
                    >
                        <WorkspacesIcon fontSize="small" /> Workflows
                    </NavLink>
                    <NavLink
                        to="/workflow-dashboard"
                        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-indigo-200 [&.active]:bg-indigo-500 [&.active]:text-white"
                        onClick={onClose}
                    >
                        <DataObjectIcon fontSize="small" /> Workflow Studio
                    </NavLink>
                </nav>
            </aside>
        </div>
    );
}
