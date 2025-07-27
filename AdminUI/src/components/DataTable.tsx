import type { ReactNode } from 'react';

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

export function DataTable<T>({ columns, data, onRowClick }: Props<T>) {
    return (
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-neutral-700 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-primary text-white dark:bg-primary-dark">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider ${col.onHeaderClick ? 'cursor-pointer select-none' : ''} ${col.headerClassName ?? ''}`.trim()}
                                onClick={col.onHeaderClick}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {data.map((row, idx) => (
                        <tr
                            key={idx}
                            onClick={() => onRowClick?.(row)}
                            className={`${idx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-gray-50 dark:bg-neutral-800'} ${onRowClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700' : ''}`}
                        >
                            {columns.map((col, i) => (
                                <td key={i} className="px-3 py-2 whitespace-nowrap">
                                    {col.accessor(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
