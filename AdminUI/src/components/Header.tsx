import styled from 'styled-components';
import { useTheme } from '../ThemeContext';

const HeaderWrapper = styled.header`
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.primaryLight};
`;

const ToggleButton = styled.button`
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.primaryLight};
    color: #fff;
    cursor: pointer;
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

export function Header() {
    const { dark, toggle } = useTheme();

    return (
        <HeaderWrapper>
            <h1>AdminUI</h1>
            <Right>
                <ToggleButton onClick={toggle}>{dark ? 'Light' : 'Dark'}</ToggleButton>
                <Avatar />
            </Right>
        </HeaderWrapper>
    );
}
