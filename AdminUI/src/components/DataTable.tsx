import type { ReactNode } from 'react';
import styled from 'styled-components';

interface Column<T> {
    header: string;
    accessor: (row: T) => ReactNode;
    onHeaderClick?: () => void;
    headerClassName?: string;
    ariaSort?: 'none' | 'ascending' | 'descending';
}

interface Props<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
}


const Table = styled.table`
    width: 100%;
    min-width: 100%;
    border-collapse: collapse;
`;

const Thead = styled.thead`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    position: sticky;
    top: 0;
    z-index: 1;
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
    word-break: break-word;
`;

const Wrapper = styled.div`
    overflow-x: auto;
    border: 1px solid ${({ theme }) => theme.colors.primaryLight};
    border-radius: 4px;

    @media (max-width: 640px) {
        ${Th}, ${Td} {
            display: block;
            width: 100%;
        }
        ${Tr} {
            display: block;
            margin-bottom: ${({ theme }) => theme.spacing.sm};
        }
        ${Table} {
            min-width: 100%;
        }
    }
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
                                aria-sort={col.ariaSort}
                            >
                                {col.header}
                            </Th>
                        ))}
                    </tr>
                </Thead>
                <Tbody>
                    {data.length === 0 ? (
                        <Tr interactive={false} even={false}>
                            <Td colSpan={columns.length}>No data available</Td>
                        </Tr>
                    ) : (
                        data.map((row, idx) => (
                            <Tr
                                key={idx}
                                even={idx % 2 === 0}
                                interactive={!!onRowClick}
                                onClick={() => onRowClick?.(row)}
                                tabIndex={onRowClick ? 0 : -1}
                                onKeyDown={e => {
                                    if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                                        e.preventDefault();
                                        onRowClick(row);
                                    }
                                }}
                            >
                                {columns.map((col, i) => (
                                    <Td key={i}>{col.accessor(row)}</Td>
                                ))}
                            </Tr>
                        ))
                    )}
                </Tbody>
            </Table>
        </Wrapper>
    );
}
