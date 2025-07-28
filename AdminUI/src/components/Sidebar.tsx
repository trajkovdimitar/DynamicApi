import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Root = styled.aside`
    width: 12rem;
    background: ${({ theme }) => theme.colors.secondary};
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const Nav = styled.nav`
    flex: 1;
    padding: ${({ theme }) => theme.spacing.sm};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
`;

const LinkItem = styled(NavLink)`
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: 4px;
    &:hover {
        background: ${({ theme }) => theme.colors.border};
    }
`;

export function Sidebar() {
    return (
        <Root>
            <Nav>
                <LinkItem to="/">Dashboard</LinkItem>
                <LinkItem to="/models">Models</LinkItem>
                <LinkItem to="/rules">Rules</LinkItem>
                <LinkItem to="/workflows">Workflows</LinkItem>
                <LinkItem to="/workflow-dashboard">Workflow Studio</LinkItem>
            </Nav>
        </Root>
    );
}
