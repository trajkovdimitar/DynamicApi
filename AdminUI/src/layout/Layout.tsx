import type { ReactNode } from 'react';
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
`;

export function Layout({ children }: Props) {
    return (
        <Wrapper>
            <Sidebar />
            <Content>
                <Header />
                <Main>{children}</Main>
            </Content>
        </Wrapper>
    );
}
