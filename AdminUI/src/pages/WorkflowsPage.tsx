import { useState } from 'react';
import { getWorkflows, getWorkflow, saveWorkflow, rollbackWorkflow } from '../services/workflows';
import type { WorkflowDefinition } from '../types/models';
import { stepTypes } from '../types/models';
import Toast from '../components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WorkflowEditorForm, { defaultParams } from '../components/WorkflowEditorForm';

export default function WorkflowsPage() {
    const queryClient = useQueryClient();
    const { data: items } = useQuery<WorkflowDefinition[]>({ queryKey: ['workflows'], queryFn: getWorkflows });
    const [editing, setEditing] = useState<WorkflowDefinition | null>(null);
    const [original, setOriginal] = useState<WorkflowDefinition | null>(null);
    const [filter, setFilter] = useState('');
    const [toast, setToast] = useState('');

    const saveMutation = useMutation<void, Error, WorkflowDefinition>({
        mutationFn: saveWorkflow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            setToast('Workflow saved');
        },
        onError: () => setToast('Failed to save workflow'),
    });

    const openEditor = async (name: string | null) => {
        if (name) {
            const wf = await getWorkflow(name);
            setOriginal(wf);
            setEditing(JSON.parse(JSON.stringify(wf)));
        } else {
            const def: WorkflowDefinition = {
                workflowName: '',
                steps: [
                    {
                        type: stepTypes[0],
                        parameters: JSON.parse(JSON.stringify(defaultParams[stepTypes[0]])),
                        condition: '',
                        onError: '',
                        outputVariable: '',
                    },
                ],
                isTransactional: false,
                globalVariables: [],
            };
            setOriginal(def);
            setEditing(def);
        }
    };

    const save = async (def: WorkflowDefinition) => {
        await saveMutation.mutateAsync(def);
        setEditing(null);
    };

    const hasChanges =
        editing && original && JSON.stringify(editing) !== JSON.stringify(original);

    const cancelEdit = () => {
        if (hasChanges && !confirm('Discard unsaved changes?')) return;
        setEditing(null);
    };

    const reset = () => {
        if (original) setEditing(JSON.parse(JSON.stringify(original)));
    };

    const filtered = (items ?? []).filter(w =>
        w.workflowName.toLowerCase().includes(filter.toLowerCase()),
    );

    return (
        <>
        <div className="p-4 space-y-2">
            <h2 className="text-xl font-semibold">Workflows</h2>
            <div className="space-y-2">
                <input
                    className="border rounded p-2 dark:bg-neutral-800"
                    placeholder="Search workflows"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <button className="px-4 py-1 bg-blue-600 text-white" onClick={() => openEditor(null)}>New Workflow</button>
            </div>
            <ul>
                {filtered.map(w => (
                    <li key={w.workflowName} className="flex justify-between">
                        <span>{w.workflowName} (v{w.version ?? 1})</span>
                        <div className="space-x-2">
                            <button onClick={() => openEditor(w.workflowName)} className="text-blue-600">Edit</button>
                            {w.version && w.version > 1 && (
                                <button onClick={() => rollbackWorkflow(w.workflowName, w.version! - 1)} className="text-red-600">Rollback</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            {editing && (
                <div className="space-y-4 mt-4 p-4 border rounded shadow-md dark:bg-neutral-700">
                    {hasChanges && (
                        <p className="text-sm text-orange-600">You have unsaved changes.</p>
                    )}
                    <WorkflowEditorForm workflow={editing} onChange={setEditing} />
                    <div className="flex justify-end space-x-2">
                        <button onClick={reset} className="px-4 py-2 rounded bg-gray-300 dark:bg-neutral-600">Reset</button>
                        <button onClick={cancelEdit} className="px-4 py-2 rounded bg-gray-300 dark:bg-neutral-600">
                            Cancel
                        </button>
                        <button
                            onClick={() => editing && save(editing)}
                            className="px-4 py-2 rounded bg-blue-600 text-white"
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}
        </div>
        <Toast message={toast} onClose={() => setToast('')} />
        </>
    );
}
