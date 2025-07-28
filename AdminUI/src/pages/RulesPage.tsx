import { useEffect, useState } from 'react';
import { getWorkflows, saveWorkflow } from '../services/rules';
import { getModels } from '../services/models';
import type { Workflow } from '../types/models';
import { RuleEditorForm } from '../components/RuleEditorForm';
import { DataTable } from '../components/DataTable';

export default function RulesPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [editing, setEditing] = useState<Workflow | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Tracks initial data loading
    const [isSaving, setIsSaving] = useState(false); // Tracks saving process
    const [error, setError] = useState<string | null>(null); // Stores any error messages

    // Effect for initial data fetching
    useEffect(() => {
        const fetchWorkflows = async () => {
            setIsLoading(true);
            setError(null); // Clear previous errors
            try {
                const data = await getWorkflows();
                setWorkflows(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load rules. Please try again later.");
                setWorkflows([]); // Ensure it's an empty array even on fetch error
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkflows();
    }, []); // Empty dependency array means this runs once on mount

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
        return <div>Loading rules...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
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
                <button onClick={() => startEdit(row)}>
                    Edit
                </button>
            ),
        },
    ];

    return (
        <div>
            <div>
                <h2>Rules</h2>
                <button onClick={() => startEdit()}>
                    New
                </button>
            </div>
            <DataTable columns={columns} data={workflows} />

            {editing && (
                <div>
                    <h3>{editing.workflowName ? `Editing: ${editing.workflowName}` : 'New Workflow'}</h3>
                    <RuleEditorForm workflow={editing} onChange={setEditing} suggestions={suggestions} />
                    <div>
                        <button onClick={() => setEditing(null)} disabled={isSaving}>
                            Cancel
                        </button>
                        <button onClick={save} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}