import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getModels } from '../services/models';
import { Button } from '../components/common/Button';
import type { ModelDefinition } from '../types/models';
import { DataTable } from '../components/DataTable';
import Skeleton from '../components/common/Skeleton';

export default function ModelsPage() {
    const navigate = useNavigate();
    const [models, setModels] = useState<ModelDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const columns = [
        {
            header: 'Name',
            accessor: (row: ModelDefinition) => row.modelName,
        },
        {
            header: 'Fields',
            accessor: (row: ModelDefinition) => row.properties.length,
        },
        {
            header: 'Actions',
            accessor: (row: ModelDefinition) => (
                <Button size="sm" onClick={() => navigate(`/models/${row.modelName}`)}>
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Models</h2>
                <div className="space-x-2">
                    <Button as={Link} to="/models/new" size="sm">
                        New
                    </Button>
                    <Button variant="secondary" size="sm" onClick={loadModels}>
                        Refresh
                    </Button>
                </div>
            </div>
            <DataTable columns={columns} data={models} />
        </div>
    );
}