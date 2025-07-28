import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getModels } from '../services/models';
import { Button } from '../components/common/Button';
import type { ModelDefinition } from '../types/models';
import { DataTable } from '../components/DataTable';
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

    const columns = [
        {
            header: `Name${sortField === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}`,
            accessor: (row: ModelDefinition) => row.modelName,
            onHeaderClick: () => toggleSort('name'),
            ariaSort: sortField === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none',
        },
        {
            header: `Fields${sortField === 'fields' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}`,
            accessor: (row: ModelDefinition) => row.properties.length,
            onHeaderClick: () => toggleSort('fields'),
            ariaSort: sortField === 'fields' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none',
        },
        {
            header: 'Actions',
            accessor: (row: ModelDefinition) => (
                <Button size="sm" onClick={() => navigate(`/models/${row.modelName}`)} title="Edit model">
                    Edit
                </Button>
            ),
        },
    ];

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
            <DataTable columns={columns} data={pageData} page={page} pageSize={pageSize} onPageChange={setPage} />
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