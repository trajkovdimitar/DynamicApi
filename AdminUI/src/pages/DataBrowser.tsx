import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getModels } from '../services/models';
import { getRecords, deleteRecord, saveRecord } from '../services/data';
import type { ModelDefinition } from '../types/models';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { FormFieldBuilder } from '../components/FormFieldBuilder';

export default function DataBrowser() {
    const { name } = useParams();
    const [model, setModel] = useState<ModelDefinition | null>(null);
    const [records, setRecords] = useState<Record<string, unknown>[]>([]);
    const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});

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

    const openCreate = () => {
        setFormValues({});
        setIsCreating(true);
        setDrawerOpen(true);
    };

    const create = async () => {
        if (!name) return;
        await saveRecord(name, formValues);
        const list = await getRecords(name);
        setRecords(list);
        setDrawerOpen(false);
    };

    if (!model) return <div>Loading...</div>;

    const columns = model.properties.map(p => ({
        header: p.name,
        accessor: (row: Record<string, unknown>) => row[p.name] as React.ReactNode,
    }));

    columns.push({
        header: '',
        accessor: (row: Record<string, unknown>) => (
            <button onClick={() => remove((row as Record<string, unknown>).id ?? (row as Record<string, unknown>).Id)}>
                Delete
            </button>
        ),
    });

    const fields = model.properties.map(p => ({ name: p.name, label: p.name, type: 'text' }));

    return (
        <div>
            <div>
                <h2>{name}</h2>
                <button onClick={openCreate}>
                    New Record
                </button>
            </div>
            <DataTable columns={columns} data={records} onRowClick={r => { setSelected(r); setIsCreating(false); setDrawerOpen(true); }} />
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                {isCreating ? (
                    <div>
                        <h3>New {name}</h3>
                        <FormFieldBuilder fields={fields} values={formValues} onChange={(n, v) => setFormValues({ ...formValues, [n]: v })} />
                        <button onClick={create}>
                            Create
                        </button>
                    </div>
                ) : selected ? (
                    <div>
                        <h3>Details</h3>
                        <ul>
                            {Object.entries(selected).map(([k, v]) => (
                                <li key={k}>
                                    <span>{k}:</span> {String(v)}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </Drawer>
        </div>
    );
}
