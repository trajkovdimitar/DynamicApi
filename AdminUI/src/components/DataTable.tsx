import type { ReactNode } from 'react';
import { useState } from 'react';
import clsx from 'clsx';

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
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    selectableRows?: boolean;
    onSelectionChange?: (rows: T[]) => void;
    rowKey?: (row: T) => string | number;
}




export function DataTable<T>({
    columns,
    data,
    onRowClick,
    page = 1,
    pageSize = data.length,
    onPageChange,
    selectableRows = false,
    onSelectionChange,
    rowKey,
}: Props<T>) {
    const totalPages = Math.ceil(data.length / pageSize);
    const start = (page - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);

    const getKey = (row: T, index: number) =>
        rowKey ? rowKey(row) : `${start + index}`;

    const [selected, setSelected] = useState<Set<string | number>>(new Set());

    const toggleRow = (key: string | number) => {
        const newSelected = new Set(selected);
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        setSelected(newSelected);
        onSelectionChange?.(
            data.filter((r, i) => newSelected.has(rowKey ? rowKey(r) : `${i}`))
        );
    };

    const allSelected = pageData.every((r, i) =>
        selected.has(getKey(r, i))
    );

    const toggleAll = () => {
        const newSelected = new Set(selected);
        if (allSelected) {
            pageData.forEach((r, i) => newSelected.delete(getKey(r, i)));
        } else {
            pageData.forEach((r, i) => newSelected.add(getKey(r, i)));
        }
        setSelected(newSelected);
        onSelectionChange?.(
            data.filter((r, i) => newSelected.has(rowKey ? rowKey(r) : `${i}`))
        );
    };

    return (
        <div className="overflow-x-auto rounded border border-indigo-200">
            <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-indigo-600 text-white">
                    <tr>
                        {selectableRows && (
                            <th className="p-2">
                                <input
                                    type="checkbox"
                                    onChange={toggleAll}
                                    checked={allSelected}
                                />
                            </th>
                        )}
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                onClick={col.onHeaderClick}
                                aria-sort={col.ariaSort}
                                className={clsx(
                                    'p-2 text-left text-xs uppercase',
                                    col.headerClassName,
                                    col.onHeaderClick && 'cursor-pointer select-none'
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pageData.length === 0 ? (
                        <tr>
                            <td className="p-2" colSpan={columns.length}>No data available</td>
                        </tr>
                    ) : (
                        pageData.map((row, idx) => {
                            const key = getKey(row, idx);
                            return (
                                <tr
                                    key={key}
                                    tabIndex={onRowClick ? 0 : -1}
                                    onClick={() => onRowClick?.(row)}
                                    onKeyDown={e => {
                                        if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                                            e.preventDefault();
                                            onRowClick(row);
                                        }
                                    }}
                                    className={clsx(
                                        idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700',
                                        onRowClick && 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-600'
                                    )}
                                >
                                    {selectableRows && (
                                        <td className="p-2">
                                            <input
                                                type="checkbox"
                                                onChange={() => toggleRow(key)}
                                                checked={selected.has(key)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col, i) => (
                                        <td key={i} className="p-2 whitespace-nowrap break-words">
                                            {col.accessor(row)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
            {totalPages > 1 && onPageChange && (
                <div className="flex justify-end gap-2 p-2 text-sm">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Prev
                    </button>
                    <ul className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <li key={n}>
                                <button
                                    className={clsx(
                                        'rounded px-2 py-1',
                                        n === page ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-100'
                                    )}
                                    onClick={() => onPageChange(n)}
                                >
                                    {n}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
