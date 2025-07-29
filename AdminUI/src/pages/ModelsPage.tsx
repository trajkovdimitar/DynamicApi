import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getModels } from '../services/models';
import { Button } from '../components/common/Button';
import type { ModelDefinition } from '../types/models';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Skeleton from '../components/common/Skeleton';
import { Breadcrumb } from '../components/Breadcrumb';

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
            <div className="overflow-hidden rounded border border-indigo-200">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-indigo-600 text-white">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    onClick={() => toggleSort('name')}
                                    aria-sort={sortField === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    className="p-2 text-left text-xs uppercase cursor-pointer"
                                >
                                    Name{sortField === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                                </TableCell>
                                <TableCell
                                    isHeader
                                    onClick={() => toggleSort('fields')}
                                    aria-sort={sortField === 'fields' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    className="p-2 text-left text-xs uppercase cursor-pointer"
                                >
                                    Fields{sortField === 'fields' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                                </TableCell>
                                <TableCell isHeader className="p-2 text-left text-xs uppercase">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageData.length === 0 ? (
                                <TableRow>
                                    <TableCell className="p-2" colSpan={3}>
                                        No data available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageData.map(m => (
                                    <TableRow
                                        key={m.modelName}
                                        className="odd:bg-white even:bg-gray-50 hover:bg-indigo-50"
                                    >
                                        <TableCell className="p-2">{m.modelName}</TableCell>
                                        <TableCell className="p-2">{m.properties.length}</TableCell>
                                        <TableCell className="p-2">
                                            <Button
                                                size="sm"
                                                onClick={() => navigate(`/models/${m.modelName}`)}
                                                title="Edit model"
                                            >
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
