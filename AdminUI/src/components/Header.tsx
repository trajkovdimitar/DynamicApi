import styled from 'styled-components';
import { useTheme } from '../ThemeContext';
import { Button } from './common/Button';

interface Props {
    onMenuClick: () => void;
}

const HeaderWrapper = styled.header`
    position: sticky;
    top: 0;
    z-index: 10;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.primaryLight};
    background: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const MenuButton = styled.button`
    display: none;
    background: none;
    border: none;
    font-size: ${({ theme }) => theme.fontSizes.lg};
    @media (max-width: 768px) {
        display: inline-block;
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primaryLight};
        outline-offset: 2px;
    }
`;


const Avatar = styled.div`
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: gray;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
`;

export function Header({ onMenuClick }: Props) {
    const { dark, toggle } = useTheme();

    return (
        <HeaderWrapper>
            <MenuButton aria-label="Open menu" onClick={onMenuClick}>☰</MenuButton>
            <h1>AdminUI</h1>
            <Right>
                <Button variant="secondary" onClick={toggle} aria-label="Toggle dark mode">
                    {dark ? 'Light' : 'Dark'}
                </Button>
                <Avatar role="img" aria-label="User avatar" />
            </Right>
        </HeaderWrapper>
    );
}
