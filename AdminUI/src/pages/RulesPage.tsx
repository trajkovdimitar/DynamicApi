import { useEffect, useState } from 'react';
import { getWorkflows, saveWorkflow } from '../services/rules';
import { getModels } from '../services/models';
import type { Workflow } from '../types/models';
import { RuleEditorForm } from '../components/RuleEditorForm';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/common/Button';

export default function RulesPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [editing, setEditing] = useState<Workflow | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Tracks initial data loading
    const [isSaving, setIsSaving] = useState(false); // Tracks saving process
    const [error, setError] = useState<string | null>(null); // Stores any error messages

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

    const columns = [
        {
            header: 'Name',
            accessor: (row: Workflow) => row.workflowName,
        },
        {
            header: 'Rules',
            accessor: (row: Workflow) => row.rules.length,
        },
        {
            header: 'Actions',
            accessor: (row: Workflow) => (
                <Button size="sm" onClick={() => startEdit(row)}>Edit</Button>
            ),
        },
    ];

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Rules</h2>
                <div className="space-x-2">
                    <Button onClick={() => startEdit()} size="sm">New</Button>
                    <Button variant="secondary" size="sm" onClick={loadWorkflows}>
                        Refresh
                    </Button>
                </div>
            </div>
            <DataTable columns={columns} data={workflows} />

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