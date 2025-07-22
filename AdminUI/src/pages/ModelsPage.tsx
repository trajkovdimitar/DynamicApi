import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getModels } from '../services/models';
import type { ModelDefinition } from '../types/models';

export default function ModelsPage() {
    const [models, setModels] = useState<ModelDefinition[]>([]);

    useEffect(() => {
        getModels().then(setModels).catch(console.error);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Models</h2>
                <Link className="px-3 py-1 rounded bg-blue-600 text-white" to="/models/new">
                    New Model
                </Link>
            </div>
            <ul className="space-y-1">
                {models.map(m => (
                    <li key={m.modelName}>
                        <Link className="text-blue-600" to={`/models/${m.modelName}`}>{m.modelName}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
