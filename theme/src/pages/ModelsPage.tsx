import { useEffect, useState } from 'react';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import PageMeta from '../components/common/PageMeta';
import ComponentCard from '../components/common/ComponentCard';
import Button from '../components/ui/button/Button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import { getModels } from '../services/models';
import type { ModelDefinition } from '../types/models';

export default function ModelsPage() {
    const [models, setModels] = useState<ModelDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<'name' | 'fields'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const loadModels = () => {
        setIsLoading(true);
        getModels()
            .then(data => {
                setModels(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load models.');
                setIsLoading(false);
            });
    };

    useEffect(() => {
        loadModels();
    }, []);

    const toggleSort = (field: 'name' | 'fields') => {
        if (sortField === field) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const sorted = [...models].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortField === 'name') {
            return a.modelName.localeCompare(b.modelName) * dir;
        }
        return (a.properties.length - b.properties.length) * dir;
    });

    const totalPages = Math.ceil(sorted.length / pageSize);
    const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div>
            <PageMeta title="Models" description="List of dynamic models" />
            <PageBreadcrumb pageTitle="Models" />
            <ComponentCard title="Models">
                <div className="mb-4 flex justify-end gap-2">
                    <Button size="sm" onClick={loadModels}>Refresh</Button>
                </div>
                {error && (
                    <div className="mb-4 text-sm text-red-600">{error}</div>
                )}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                                        onClick={() => toggleSort('name')}
                                    >
                                        Name{sortField === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                                        onClick={() => toggleSort('fields')}
                                    >
                                        Fields{sortField === 'fields' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell className="p-4" colSpan={2}>Loading...</TableCell>
                                    </TableRow>
                                ) : pageData.length === 0 ? (
                                    <TableRow>
                                        <TableCell className="p-4" colSpan={2}>No data available</TableCell>
                                    </TableRow>
                                ) : (
                                    pageData.map(m => (
                                        <TableRow key={m.modelName} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                                            <TableCell className="px-5 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                                                {m.modelName}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                                                {m.properties.length}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-end gap-2 text-sm">
                        <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                        <span className="self-center">
                            {page} / {totalPages}
                        </span>
                        <Button size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                    </div>
                )}
            </ComponentCard>
        </div>
    );
}
