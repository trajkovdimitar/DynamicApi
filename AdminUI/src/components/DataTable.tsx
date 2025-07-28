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
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th<{ clickable: boolean }>`
    padding: ${({ theme }) => theme.spacing.sm};
    text-align: left;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
    ${({ clickable }) => clickable && 'cursor: pointer; user-select: none;'}
`;

const Td = styled.td`
    padding: ${({ theme }) => theme.spacing.sm};
    white-space: nowrap;
`;

const Row = styled.tr<{ odd: boolean; clickable: boolean }>`
    background: ${({ theme, odd }) =>
        odd ? theme.colors.background : theme.colors.secondary};
    &:hover {
        ${({ clickable, theme }) => clickable && `background: ${theme.colors.border};`}
    }
`;

export function DataTable<T>({ columns, data, onRowClick }: Props<T>) {
    return (
        <Wrapper>
            <Table>
                <thead style={{ background: '#6b46ff', color: 'white' }}>
                    <tr>
                        {columns.map((col, idx) => (
                            <Th key={idx} clickable={!!col.onHeaderClick} onClick={col.onHeaderClick} className={col.headerClassName}>
                                {col.header}
                            </Th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <Row
                            key={idx}
                            odd={idx % 2 === 0}
                            clickable={!!onRowClick}
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((col, i) => (
                                <Td key={i}>{col.accessor(row)}</Td>
                            ))}
                        </Row>
                    ))}
                </tbody>
            </Table>
        </Wrapper>
    );
}
