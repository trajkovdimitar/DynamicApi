import { useEffect, useState } from 'react';
import { getWorkflows, saveWorkflow } from '../services/rules';
import { getModels } from '../services/models';
import type { Workflow } from '../types/models';
import { RuleEditorForm } from '../components/RuleEditorForm';

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
        return <div className="text-center p-4">Loading rules...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Rules</h2>
                <button onClick={() => startEdit()} className="px-3 py-1 rounded bg-blue-600 text-white">
                    New
                </button>
            </div>
            <ul className="space-y-1">
                {/* Now, workflows is guaranteed to be an array, so .length and .map are safe */}
                {workflows.length > 0 ? (
                    workflows.map(w => (
                        <li key={w.workflowName} className="flex justify-between items-center py-1">
                            <span>{w.workflowName}</span>
                            <button className="text-blue-600 hover:underline" onClick={() => startEdit(w)}>
                                Edit
                            </button>
                        </li>
                    ))
                ) : (
                    <li className="text-gray-500">No rules found.</li>
                )}
            </ul>

            {editing && (
                <div className="space-y-2 mt-4 p-4 border rounded shadow-md dark:bg-neutral-700">
                    <h3 className="text-lg font-semibold">{editing.workflowName ? `Editing: ${editing.workflowName}` : 'New Workflow'}</h3>
                    <RuleEditorForm workflow={editing} onChange={setEditing} suggestions={suggestions} />
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setEditing(null)}
                            className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={save}
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}