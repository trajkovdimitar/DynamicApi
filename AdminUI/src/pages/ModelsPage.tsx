import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getModels } from '../services/models';
import type { ModelDefinition } from '../types/models';

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Models</h2>
                <Link className="px-3 py-1 rounded bg-blue-600 text-white" to="/models/new">
                    New Model
                </Link>
            </div>
            <ul className="space-y-1">
                {/* Add a check here just in case, though the above solutions should prevent it */}
                {Array.isArray(models) && models.length > 0 ? (
                    models.map(m => (
                        <li key={m.modelName}>
                            <Link className="text-blue-600" to={`/models/${m.modelName}`}>{m.modelName}</Link>
                        </li>
                    ))
                ) : (
                    <li>No models found.</li> // Message if models array is empty
                )}
            </ul>
        </div>
    );
}