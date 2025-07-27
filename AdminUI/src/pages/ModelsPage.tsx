import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getModels } from '../services/models';
import type { ModelDefinition } from '../types/models';
import { DataTable } from '../components/DataTable';

export default function ModelsPage() {
    const [models, setModels] = useState<ModelDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [error, setError] = useState<string | null>(null); // Add error state

    useEffect(() => {
        getModels()
            .then(data => {
                setModels(data);
                setIsLoading(false); // Set loading to false on success
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load models. Please try again later."); // Set error message
                setIsLoading(false); // Set loading to false on error
            });
    }, []);

    if (isLoading) {
        return <div className="text-center">Loading models...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600">{error}</div>;
    }

    const columns = [
        {
            header: 'Name',
            accessor: (row: ModelDefinition) => (
                <Link className="text-blue-600 hover:underline" to={`/models/${row.modelName}`}>{row.modelName}</Link>
            ),
        },
        {
            header: 'Fields',
            accessor: (row: ModelDefinition) => row.properties.length,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Models</h2>
                <Link className="btn btn-primary" to="/models/new">
                    New Model
                </Link>
            </div>
            <DataTable columns={columns} data={models} />
        </div>
    );
}