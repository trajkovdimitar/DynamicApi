import { useEffect, useState } from 'react';
import { getWorkflows, saveWorkflow } from '../services/rules';
import type { Workflow } from '../types/models';

export default function RulesPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [editing, setEditing] = useState<Workflow | null>(null);
    const [text, setText] = useState('');
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

    const startEdit = (wf?: Workflow) => {
        // If no workflow is provided, create a new empty one
        const w = wf ?? { workflowName: '', rules: [] };
        setEditing(w);
        setText(JSON.stringify(w, null, 2));
        setError(null); // Clear any previous errors when starting an edit
    };

    const save = async () => {
        if (!editing) return; // Should not happen if UI is correctly controlled
        setIsSaving(true);
        setError(null); // Clear previous errors
        try {
            const parsedWorkflow: Workflow = JSON.parse(text); // Ensure parsing is robust
            await saveWorkflow(parsedWorkflow);
            setEditing(null); // Close the edit form
            // Re-fetch all workflows to get the most up-to-date list, including the new/updated one
            const updatedWorkflows = await getWorkflows();
            setWorkflows(updatedWorkflows);
        } catch (err) {
            console.error(err);
            // Provide a more user-friendly error message for saving
            setError(`Failed to save workflow. Please check the JSON format or network connection. Error: ${(err as Error).message}`);
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
                    <textarea
                        className="w-full h-40 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 p-2 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Enter workflow JSON here..."
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setEditing(null)} // Cancel button
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