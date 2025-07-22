import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getModels } from '../services/models';
import { getRecords, deleteRecord } from '../services/data';
import type { ModelDefinition } from '../types/models';
import { DataTable } from '../components/DataTable';

export default function DataBrowser() {
    const { name } = useParams();
    const [model, setModel] = useState<ModelDefinition | null>(null);
    const [records, setRecords] = useState<Record<string, unknown>[]>([]);

    useEffect(() => {
        if (!name) return;
        getModels()
            .then(list => setModel(list.find(m => m.modelName === name) || null))
            .catch(console.error);
        getRecords(name)
            .then(setRecords)
            .catch(console.error);
    }, [name]);

    const remove = async (id: unknown) => {
        if (!name) return;
        await deleteRecord(name, String(id));
        setRecords(r => r.filter(x => (x as Record<string, unknown>).id !== id && (x as Record<string, unknown>).Id !== id));
    };

    if (!model) return <div>Loading...</div>;

    const columns = model.properties.map(p => ({
        header: p.name,
        accessor: (row: Record<string, unknown>) => row[p.name] as React.ReactNode,
    }));

    columns.push({
        header: '',
        accessor: (row: Record<string, unknown>) => (
            <div className="space-x-2">
                <Link className="text-blue-600" to={`/data/${name}/${(row as Record<string, unknown>).id ?? (row as Record<string, unknown>).Id}`}>Edit</Link>
                <button className="text-red-600" onClick={() => remove((row as Record<string, unknown>).id ?? (row as Record<string, unknown>).Id)}>
                    Delete
                </button>
            </div>
        ),
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{name}</h2>
                <Link className="px-3 py-1 rounded bg-blue-600 text-white" to={`/data/${name}/new`}>
                    New Record
                </Link>
            </div>
            <DataTable columns={columns} data={records} />
        </div>
    );
}
