import type { ReactNode } from 'react';

interface Column<T> {
    header: string;
    accessor: (row: T) => ReactNode;
}

interface Props<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
}

export function DataTable<T>({ columns, data, onRowClick }: Props<T>) {
    return (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
            <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr>
                    {columns.map((col, idx) => (
                        <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
                {data.map((row, idx) => (
                    <tr
                        key={idx}
                        onClick={() => onRowClick?.(row)}
                        className={onRowClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800' : ''}
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
    );
}
