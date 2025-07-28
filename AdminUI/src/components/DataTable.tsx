import type { ReactNode } from 'react';
import styled from 'styled-components';

interface Column<T> {
    header: string;
    accessor: (row: T) => ReactNode;
    onHeaderClick?: () => void;
    headerClassName?: string;
}

interface Props<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
}

const Wrapper = styled.div`
    overflow-x: auto;
    border: 1px solid ${({ theme }) => theme.colors.primaryLight};
    border-radius: 4px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Thead = styled.thead`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
`;

const Th = styled.th<{ clickable: boolean }>`
    padding: ${({ theme }) => theme.spacing.sm};
    text-align: left;
    font-size: 0.75rem;
    text-transform: uppercase;
    ${({ clickable }) => clickable && 'cursor: pointer; user-select: none;'}
`;

const Tbody = styled.tbody``;

const Tr = styled.tr<{ interactive: boolean; even: boolean }>`
    background: ${({ even, theme }) =>
        even ? theme.colors.background : `${theme.colors.primaryLight}10`};
    ${({ interactive, theme }) =>
        interactive &&
        `cursor: pointer;
        transition: background ${theme.transitions.fast};
        &:hover { background: ${theme.colors.accent}30; }`}
`;

const Td = styled.td`
    padding: ${({ theme }) => theme.spacing.sm};
    white-space: nowrap;
`;

export function DataTable<T>({ columns, data, onRowClick }: Props<T>) {
    return (
        <Wrapper>
            <Table>
                <Thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <Th
                                clickable={!!col.onHeaderClick}
                                key={idx}
                                onClick={col.onHeaderClick}
                            >
                                {col.header}
                            </Th>
                        ))}
                    </tr>
                </Thead>
                <Tbody>
                    {data.map((row, idx) => (
                        <Tr
                            key={idx}
                            even={idx % 2 === 0}
                            interactive={!!onRowClick}
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((col, i) => (
                                <Td key={i}>{col.accessor(row)}</Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Wrapper>
    );
}
