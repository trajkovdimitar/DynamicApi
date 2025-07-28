import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getModels } from '../services/models';
import { getRecords, deleteRecord, saveRecord } from '../services/data';
import type { ModelDefinition } from '../types/models';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { FormFieldBuilder } from '../components/FormFieldBuilder';
import { Button } from '../components/common/Button';
import { Modal } from '../components/Modal';
import { Breadcrumb } from '../components/Breadcrumb';
import Skeleton from '../components/common/Skeleton';

export default function DataBrowser() {
    const { name } = useParams();
    const [model, setModel] = useState<ModelDefinition | null>(null);
    const [records, setRecords] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});
    const [confirmDelete, setConfirmDelete] = useState<unknown | null>(null);

    useEffect(() => {
        if (!name) return;
        setLoading(true);
        getModels()
            .then(list => setModel(list.find(m => m.modelName === name) || null))
            .catch(console.error);
        getRecords(name)
            .then(setRecords)
            .catch(console.error)
            .finally(() => setLoading(false));
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

    if (loading || !model) {
        return (
            <div className="space-y-2">
                <Skeleton height="2rem" />
                <Skeleton height="2rem" />
                <Skeleton height="2rem" />
            </div>
        );
    }

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
                    setConfirmDelete(
                        (row as Record<string, unknown>).id ??
                            (row as Record<string, unknown>).Id,
                    )
                }
                title="Delete record"
            >
                Delete
            </Button>
        ),
    });

    const fields = model.properties.map(p => ({ name: p.name, label: p.name, type: 'text' }));

    return (
        <div className="space-y-4">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Models', href: '/models' }, { label: name ?? '' }]} />
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{name}</h2>
                <Button onClick={openCreate} aria-label="Create new record" title="Create new record">New Record</Button>
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
            <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)}>
                <div className="space-y-4 w-64">
                    <h3 className="text-lg font-semibold">Confirm Delete</h3>
                    <p>Are you sure you want to delete this record?</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                if (confirmDelete !== null) {
                                    remove(confirmDelete);
                                    setConfirmDelete(null);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
