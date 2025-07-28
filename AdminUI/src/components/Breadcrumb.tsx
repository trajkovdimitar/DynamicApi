import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Item {
    label: string;
    href?: string;
}

const Nav = styled.nav`
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const List = styled.ol`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.sm};
`;

export function Breadcrumb({ items }: { items: Item[] }) {
    return (
        <Nav aria-label="Breadcrumb">
            <List>
                {items.map((item, idx) => (
                    <li key={idx}>
                        {item.href ? <Link to={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                        {idx < items.length - 1 && ' / '}
                    </li>
                ))}
            </List>
        </Nav>
    );
}
