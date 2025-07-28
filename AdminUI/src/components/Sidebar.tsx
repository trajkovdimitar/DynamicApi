import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

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
    height: 100%;
    display: flex;
    flex-direction: column;
    @media (max-width: 768px) {
        position: fixed;
        left: 0;
        top: 0;
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

export function Sidebar({ open, onClose }: Props) {
    return (
        <Wrapper open={open} onClick={onClose}>
            <Aside open={open} onClick={e => e.stopPropagation()}>
                <Nav>
                    <LinkItem to="/" onClick={onClose}>Dashboard</LinkItem>
                    <LinkItem to="/models" onClick={onClose}>Models</LinkItem>
                    <LinkItem to="/rules" onClick={onClose}>Rules</LinkItem>
                    <LinkItem to="/workflows" onClick={onClose}>Workflows</LinkItem>
                    <LinkItem to="/workflow-dashboard" onClick={onClose}>Workflow Studio</LinkItem>
                </Nav>
            </Aside>
        </Wrapper>
    );
}
