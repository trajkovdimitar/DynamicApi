import styled from 'styled-components';
import { useTheme } from '../ThemeContext';

const Root = styled.header`
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ThemeButton = styled.button`
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
`;

export function Header() {
    const { dark, toggle } = useTheme();

    return (
        <Root>
            <h1 style={{ fontSize: '1rem', fontWeight: 600 }}>AdminUI</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ThemeButton onClick={toggle}>{dark ? 'Light' : 'Dark'}</ThemeButton>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#9ca3af' }} />
            </div>
        </Root>
    );
}
