import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { FormFieldBuilder } from '../components/FormFieldBuilder';
import { Modal } from '../components/Modal';
import { Button } from '../components/common/Button';
import Input from '../components/common/Input';
import Skeleton from '../components/common/Skeleton';
import { getModels } from '../services/models';
import { deleteRecord, getRecords, saveRecord } from '../services/data';
import type { ModelDefinition } from '../types/models';

export default function ContentListPage() {
    const { name } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState<ModelDefinition | null>(null);
    const [records, setRecords] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<Record<string, unknown>[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});
    const [isCreating, setIsCreating] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<unknown | null>(null);

    useEffect(() => {
        if (!name) return;
        setLoading(true);
        Promise.all([getModels(), getRecords(name)])
            .then(([models, recs]) => {
                setModel(models.find(m => m.modelName === name) || null);
                setRecords(recs);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [name]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return records.filter(r =>
            Object.values(r).some(v => String(v).toLowerCase().includes(q)),
        );
    }, [records, search]);

    const sorted = useMemo(() => {
        if (!sortField) return filtered;
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const av = a[sortField!];
            const bv = b[sortField!];
            return String(av).localeCompare(String(bv)) * dir;
        });
    }, [filtered, sortField, sortDir]);

    const paged = useMemo(
        () => sorted.slice((page - 1) * pageSize, page * pageSize),
        [sorted, page, pageSize],
    );

    const toggleSort = (field: string) => {
        if (sortField === field) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
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

    const remove = async (ids: unknown[]) => {
        if (!name) return;
        await Promise.all(ids.map(id => deleteRecord(name, String(id))));
        const list = await getRecords(name);
        setRecords(list);
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

    const getId = (r: Record<string, unknown>) => r.id ?? r.Id;

    const columns = model.properties.map(p => ({
        header: p.name,
        accessor: (row: Record<string, unknown>) => renderValue(row[p.name]),
        onHeaderClick: () => toggleSort(p.name),
        ariaSort:
            sortField === p.name
                ? sortDir === 'asc'
                    ? 'ascending'
                    : 'descending'
                : 'none',
    }));

    columns.push({
        header: 'Actions',
        accessor: (row: Record<string, unknown>) => (
            <div className="flex gap-2">
                <Button
                    as={Link}
                    to={`/data/${name}/${getId(row)}`}
                    size="sm"
                    variant="outline"
                    title="Edit record"
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmDelete(getId(row))}
                    title="Delete record"
                >
                    Delete
                </Button>
            </div>
        ),
    });

    const fields = model.properties.map(p => ({
        name: p.name,
        label: p.name,
        type: 'text',
    }));

    const bulkDelete = async () => {
        const ids = selected.map(r => getId(r));
        await remove(ids);
        setSelected([]);
    };

    return (
        <div className="space-y-4">
            <Breadcrumb
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Content', href: '/models' },
                    { label: name ?? '' },
                ]}
            />
            <div className="flex items-center justify-between gap-2">
                <Input
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <div className="flex items-center gap-2">
                    {selected.length > 0 && (
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setConfirmDelete(selected.map(r => getId(r)))}
                        >
                            Delete Selected
                        </Button>
                    )}
                    <Button size="sm" onClick={openCreate} title="Create new record">
                        New
                    </Button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={paged}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                selectableRows
                onSelectionChange={setSelected}
                rowKey={getId}
            />
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div className="p-4 space-y-4">
                    <h3 className="text-lg font-semibold">
                        {isCreating ? `New ${name}` : 'Details'}
                    </h3>
                    {isCreating && (
                        <FormFieldBuilder
                            fields={fields}
                            values={formValues}
                            onChange={(n, v) => setFormValues({ ...formValues, [n]: v })}
                        />
                    )}
                    {isCreating && (
                        <Button onClick={create}>Create</Button>
                    )}
                </div>
            </Drawer>
            <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)}>
                <div className="space-y-4 w-64">
                    <h3 className="text-lg font-semibold">Confirm Delete</h3>
                    <p>Are you sure you want to delete this record?</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={async () => {
                                const ids = Array.isArray(confirmDelete)
                                    ? (confirmDelete as unknown[])
                                    : [confirmDelete];
                                await remove(ids);
                                setConfirmDelete(null);
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

function renderValue(value: unknown): React.ReactNode {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.match(/^https?:\/\//)) {
        return <img src={value} alt="" className="h-8 w-8 object-cover" />;
    }
    return String(value);
}
