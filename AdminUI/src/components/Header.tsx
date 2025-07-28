import styled from 'styled-components';
import { useTheme } from '../ThemeContext';
import { Button } from './common/Button';
import { SearchBar } from './SearchBar';

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

const SearchContainer = styled.div`
    flex: 1;
    margin: 0 ${({ theme }) => theme.spacing.md};
    max-width: 20rem;
`;

export function Header({ onMenuClick }: Props) {
    const { dark, toggle } = useTheme();

    return (
        <HeaderWrapper>
            <MenuButton aria-label="Open menu" onClick={onMenuClick}>☰</MenuButton>
            <h1>AdminUI</h1>
            <SearchContainer>
                <SearchBar />
            </SearchContainer>
            <Right>
                <Button
                    variant="secondary"
                    onClick={toggle}
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Button>
                <Avatar role="img" aria-label="User avatar" />
            </Right>
        </HeaderWrapper>
    );
}
