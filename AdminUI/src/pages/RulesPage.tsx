import { useEffect, useState } from 'react';
import { getWorkflows, saveWorkflow } from '../services/rules';
import { getModels } from '../services/models';
import type { Workflow } from '../types/models';
import { RuleEditorForm } from '../components/RuleEditorForm';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/common/Button';
import { Breadcrumb } from '../components/Breadcrumb';

export default function RulesPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [editing, setEditing] = useState<Workflow | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Tracks initial data loading
    const [isSaving, setIsSaving] = useState(false); // Tracks saving process
    const [error, setError] = useState<string | null>(null); // Stores any error messages
    const [sortField, setSortField] = useState<'name' | 'rules'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const loadWorkflows = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getWorkflows();
            setWorkflows(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load rules. Please try again later.');
            setWorkflows([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWorkflows();
    }, []);

    useEffect(() => {
        if (!editing) return;
        (async () => {
            const models = await getModels();
            const modelName = editing.workflowName.split('.')[0];
            const model = models.find(m => m.modelName === modelName);
            setSuggestions(model ? model.properties.map(p => p.name) : []);
        })();
    }, [editing?.workflowName]);

    const startEdit = async (wf?: Workflow) => {
        const w = wf ?? { workflowName: '', rules: [] };
        setEditing(w);
        setError(null);
        const models = await getModels();
        const modelName = w.workflowName.split('.')[0];
        const model = models.find(m => m.modelName === modelName);
        setSuggestions(model ? model.properties.map(p => p.name) : []);
    };

    const save = async () => {
        if (!editing) return;
        setIsSaving(true);
        setError(null);
        try {
            await saveWorkflow(editing);
            setEditing(null);
            const updatedWorkflows = await getWorkflows();
            setWorkflows(updatedWorkflows);
        } catch (err) {
            console.error(err);
            setError(`Failed to save workflow. ${(err as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Render logic based on states
    if (isLoading) {
        return <div className="text-center p-4">Loading rules...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">Error: {error}</div>;
    }

    const toggleSort = (field: 'name' | 'rules') => {
        if (sortField === field) {
            setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const sorted = [...workflows].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortField === 'name') {
            return a.workflowName.localeCompare(b.workflowName) * dir;
        }
        return (a.rules.length - b.rules.length) * dir;
    });

    const columns = [
        {
            header: `Name${sortField === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}`,
            accessor: (row: Workflow) => row.workflowName,
            onHeaderClick: () => toggleSort('name'),
            ariaSort: sortField === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none',
        },
        {
            header: `Rules${sortField === 'rules' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}`,
            accessor: (row: Workflow) => row.rules.length,
            onHeaderClick: () => toggleSort('rules'),
            ariaSort: sortField === 'rules' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none',
        },
        {
            header: 'Actions',
            accessor: (row: Workflow) => (
                <Button size="sm" onClick={() => startEdit(row)} title="Edit rule">Edit</Button>
            ),
        },
    ];

    const totalPages = Math.ceil(sorted.length / pageSize);
    const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-4 p-4">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Rules' }]} />
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Rules</h2>
                <div className="space-x-2">
                    <Button onClick={() => startEdit()} size="sm" title="Create new rule">New</Button>
                    <Button variant="secondary" size="sm" onClick={loadWorkflows} title="Reload rules">
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

            {editing && (
                <div className="space-y-2 mt-4 p-4 border rounded shadow-md dark:bg-neutral-700">
                    <h3 className="text-lg font-semibold">{editing.workflowName ? `Editing: ${editing.workflowName}` : 'New Workflow'}</h3>
                    <RuleEditorForm workflow={editing} onChange={setEditing} suggestions={suggestions} />
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditing(null)} size="sm" disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={save} size="sm" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}