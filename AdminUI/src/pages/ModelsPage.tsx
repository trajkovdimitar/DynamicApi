import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getModels } from '../services/models';
import { Button } from '../components/common/Button';
import type { ModelDefinition } from '../types/models';
import Skeleton from '../components/common/Skeleton';
import { Breadcrumb } from '../components/Breadcrumb';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/common/Table';

export default function ModelsPage() {
    const navigate = useNavigate();
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
                setError('Failed to load models. Please try again later.');
                setIsLoading(false);
            });
    };

    useEffect(() => {
        loadModels();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton height="2rem" />
                <Skeleton height="2rem" />
                <Skeleton height="2rem" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-600">{error}</div>;
    }

    const toggleSort = (field: 'name' | 'fields') => {
        if (sortField === field) {
            setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
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
        <div className="space-y-4">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Models' }]} />
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Models</h2>
                <div className="space-x-2">
                    <Button as={Link} to="/models/new" size="sm" title="Create new model">
                        New
                    </Button>
                    <Button variant="secondary" size="sm" onClick={loadModels} title="Reload models">
                        Refresh
                    </Button>
                </div>
            </div>
            <div className="overflow-hidden rounded border border-indigo-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-indigo-200 dark:border-gray-700">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-700 text-left cursor-pointer"
                                    onClick={() => toggleSort('name')}
                                >
                                    Name{sortField === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-700 text-left cursor-pointer"
                                    onClick={() => toggleSort('fields')}
                                >
                                    Fields{sortField === 'fields' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-700 text-left">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-indigo-200 dark:divide-gray-700">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell className="p-4" colSpan={3}>
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : pageData.length === 0 ? (
                                <TableRow>
                                    <TableCell className="p-4" colSpan={3}>
                                        No data available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageData.map(m => (
                                    <TableRow key={m.modelName} className="hover:bg-indigo-50 dark:hover:bg-gray-700">
                                        <TableCell className="px-5 py-3 text-gray-800 dark:text-gray-100">
                                            {m.modelName}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-800 dark:text-gray-100">
                                            {m.properties.length}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-gray-800 dark:text-gray-100">
                                            <Button size="sm" onClick={() => navigate(`/models/${m.modelName}`)} title="Edit model">
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        Prev
                    </Button>
                    <span className="self-center text-sm">
                        {page} / {totalPages}
                    </span>
                    <Button size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}