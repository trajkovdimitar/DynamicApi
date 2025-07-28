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
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Content>
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <Main>{children}</Main>
                <Footer>DynamicApi © 2025</Footer>
            </Content>
        </Wrapper>
    );
}
