import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import GavelIcon from '@mui/icons-material/Gavel';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import DataObjectIcon from '@mui/icons-material/DataObject';

interface Props {
    open: boolean;
    onClose?: () => void;
}
const Wrapper = styled.div<{ open: boolean }>`
    @media (max-width: 768px) {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: ${({ open }) => (open ? 'block' : 'none')};
    }
`;

const Aside = styled.aside<{ open: boolean }>`
    width: 12rem;
    background: ${({ theme }) => theme.colors.primaryLight}10;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    @media (max-width: 768px) {
        transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(-100%)')};
        transition: transform ${({ theme }) => theme.transitions.normal};
        box-shadow: ${({ theme }) => theme.shadows.lg};
        z-index: 20;
    }
`;

const Nav = styled.nav`
    flex: 1;
    padding: ${({ theme }) => theme.spacing.sm};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
`;

const LinkItem = styled(NavLink)`
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: 4px;
    text-decoration: none;
    color: inherit;
    transition: background ${({ theme }) => theme.transitions.fast};

    &:hover {
        background: ${({ theme }) => theme.colors.primaryLight};
        color: #fff;
    }

    &.active {
        background: ${({ theme }) => theme.colors.primary};
        color: #fff;
    }
`;

const Label = styled.span`
    margin-left: ${({ theme }) => theme.spacing.sm};
`;

export function Sidebar({ open, onClose }: Props) {
    return (
        <Wrapper role="button" aria-label="Close sidebar" open={open} onClick={onClose}>
            <Aside open={open} onClick={e => e.stopPropagation()}>
                <Nav>
                    <LinkItem to="/" onClick={onClose}>
                        <DashboardIcon fontSize="small" />
                        <Label>Dashboard</Label>
                    </LinkItem>
                    <LinkItem to="/models" onClick={onClose}>
                        <TableChartIcon fontSize="small" />
                        <Label>Models</Label>
                    </LinkItem>
                    <LinkItem to="/rules" onClick={onClose}>
                        <GavelIcon fontSize="small" />
                        <Label>Rules</Label>
                    </LinkItem>
                    <LinkItem to="/workflows" onClick={onClose}>
                        <WorkspacesIcon fontSize="small" />
                        <Label>Workflows</Label>
                    </LinkItem>
                    <LinkItem to="/workflow-dashboard" onClick={onClose}>
                        <DataObjectIcon fontSize="small" />
                        <Label>Workflow Studio</Label>
                    </LinkItem>
                </Nav>
            </Aside>
        </Wrapper>
    );
}
