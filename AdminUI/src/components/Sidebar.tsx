import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Aside = styled.aside`
    width: 12rem;
    background: ${({ theme }) => theme.colors.primaryLight}10;
    height: 100%;
    display: flex;
    flex-direction: column;
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

    &:hover {
        background: ${({ theme }) => theme.colors.primaryLight};
        color: #fff;
    }

    &.active {
        background: ${({ theme }) => theme.colors.primary};
        color: #fff;
    }
`;

export function Sidebar() {
    return (
        <Aside>
            <Nav>
                <LinkItem to="/">Dashboard</LinkItem>
                <LinkItem to="/models">Models</LinkItem>
                <LinkItem to="/rules">Rules</LinkItem>
                <LinkItem to="/workflows">Workflows</LinkItem>
                <LinkItem to="/workflow-dashboard">Workflow Studio</LinkItem>
            </Nav>
        </Aside>
    );
}
