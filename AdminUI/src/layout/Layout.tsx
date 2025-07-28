import type { ReactNode } from 'react';
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import styled from 'styled-components';

interface Props {
    children: ReactNode;
}

const Wrapper = styled.div`
    display: flex;
    height: 100vh;
    background: ${({ theme }) => theme.colors.background};
`;

const SkipLink = styled.a`
    position: absolute;
    left: -999px;
    top: 0;
    padding: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.colors.accent};
    color: #fff;
    z-index: 100;
    &:focus {
        left: 0;
    }
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const Main = styled.main`
    flex: 1;
    overflow: auto;
    padding: ${({ theme }) => theme.spacing.md};
    max-width: ${({ theme }) => theme.maxWidth};
    margin: 0 auto;
`;

const Footer = styled.footer`
    padding: ${({ theme }) => theme.spacing.sm};
    text-align: center;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export function Layout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Wrapper>
            <SkipLink href="#main-content">Skip to content</SkipLink>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Content>
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <Main id="main-content">{children}</Main>
                <Footer>DynamicApi © 2025</Footer>
            </Content>
        </Wrapper>
    );
}
