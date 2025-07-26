import { useState } from 'react';
import { getWorkflows, getWorkflow, saveWorkflow, rollbackWorkflow } from '../services/workflows';
import type { WorkflowDefinition } from '../types/models';
import { WorkflowEditor } from '../components/WorkflowEditor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function WorkflowsPage() {
    const queryClient = useQueryClient();
    const { data: items } = useQuery(['workflows'], getWorkflows);
    const [editing, setEditing] = useState<WorkflowDefinition | null>(null);

    const saveMutation = useMutation(saveWorkflow, {
        onSuccess: () => queryClient.invalidateQueries(['workflows']),
    });

    const openEditor = async (name: string) => {
        const wf = await getWorkflow(name);
        setEditing(wf);
    };

    const save = async (def: WorkflowDefinition) => {
        await saveMutation.mutateAsync(def);
        setEditing(null);
    };

    return (
        <div className="p-4 space-y-2">
            <h2 className="text-xl font-semibold">Workflows</h2>
            <ul>
                {(items ?? []).map(w => (
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
                <div className="space-y-2">
                    <WorkflowEditor initialWorkflow={editing} onSave={save} />
                    <div className="space-x-2">
                        <button onClick={() => setEditing(null)} className="px-4 py-1 bg-gray-300">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
