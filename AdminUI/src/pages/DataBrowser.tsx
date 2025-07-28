import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getModels } from '../services/models';
import { getRecords, deleteRecord, saveRecord } from '../services/data';
import type { ModelDefinition } from '../types/models';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { FormFieldBuilder } from '../components/FormFieldBuilder';
import { Button } from '../components/common/Button';

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
            <Button
                variant="danger"
                size="sm"
                aria-label="Delete record"
                onClick={() =>
                    remove(
                        (row as Record<string, unknown>).id ??
                            (row as Record<string, unknown>).Id,
                    )
                }
            >
                Delete
            </Button>
        ),
    });

    const fields = model.properties.map(p => ({ name: p.name, label: p.name, type: 'text' }));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{name}</h2>
                <Button onClick={openCreate}>New Record</Button>
            </div>
            <DataTable columns={columns} data={records} onRowClick={r => { setSelected(r); setIsCreating(false); setDrawerOpen(true); }} />
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                {isCreating ? (
                    <div className="p-4 space-y-4">
                        <h3 className="text-lg font-semibold mb-2">New {name}</h3>
                        <FormFieldBuilder fields={fields} values={formValues} onChange={(n, v) => setFormValues({ ...formValues, [n]: v })} />
                        <Button onClick={create}>Create</Button>
                    </div>
                ) : selected ? (
                    <div className="p-4 space-y-2">
                        <h3 className="text-lg font-semibold mb-2">Details</h3>
                        <ul className="space-y-1">
                            {Object.entries(selected).map(([k, v]) => (
                                <li key={k}>
                                    <span className="font-semibold">{k}:</span> {String(v)}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </Drawer>
        </div>
    );
}
