import { useState } from 'react';
import {
    getWorkflows,
    getWorkflow,
    saveWorkflow,
    rollbackWorkflow,
} from '../services/workflows';
import type { WorkflowDefinition } from '../types/models';
import { stepTypes } from '../types/models';
import Toast from '../components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WorkflowEditorForm, { defaultParams } from '../components/WorkflowEditorForm';
import { DataTable } from '../components/DataTable';

export default function WorkflowsPage() {
    const queryClient = useQueryClient();
    const {
        data: items,
        isLoading,
        refetch,
    } = useQuery<WorkflowDefinition[]>({ queryKey: ['workflows'], queryFn: getWorkflows });
    const [editing, setEditing] = useState<WorkflowDefinition | null>(null);
    const [original, setOriginal] = useState<WorkflowDefinition | null>(null);
    const [filter, setFilter] = useState('');
    const [toast, setToast] = useState('');
    const [sortField, setSortField] = useState<'name' | 'version'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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

    let filtered = (items ?? []).filter(w =>
        w.workflowName.toLowerCase().includes(filter.toLowerCase()),
    );

    filtered = filtered.sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortField === 'name') {
            return a.workflowName.localeCompare(b.workflowName) * dir;
        }
        return ((a.version ?? 1) - (b.version ?? 1)) * dir;
    });

    const data = filtered.map((w, idx) => ({ ...w, idx }));

    const toggleSort = (field: 'name' | 'version') => {
        if (sortField === field) {
            setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

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
                <div className="flex gap-2">
                    <button className="px-4 py-1 bg-blue-600 text-white" onClick={() => openEditor(null)}>New Workflow</button>
                    <button className="px-4 py-1 bg-gray-300 dark:bg-neutral-600" onClick={() => refetch()}>Refresh</button>
                </div>
            </div>
            <DataTable
                columns={[
                    {
                        header: '#',
                        accessor: (row: typeof data[number]) => row.idx + 1,
                    },
                    {
                        header: `Name${sortField === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}`,
                        accessor: (row: typeof data[number]) => row.workflowName,
                        onHeaderClick: () => toggleSort('name'),
                    },
                    {
                        header: `Version${sortField === 'version' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}`,
                        accessor: (row: typeof data[number]) => row.version ?? 1,
                        onHeaderClick: () => toggleSort('version'),
                    },
                    {
                        header: 'Steps',
                        accessor: (row: typeof data[number]) => row.steps.length,
                    },
                    {
                        header: 'Actions',
                        accessor: (row: typeof data[number]) => (
                            <div className="space-x-2">
                                <button onClick={() => openEditor(row.workflowName)} className="text-blue-600">Edit</button>
                                {row.version && row.version > 1 && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Rollback to previous version?'))
                                                rollbackWorkflow(row.workflowName, row.version! - 1).then(() => refetch());
                                        }}
                                        className="text-red-600"
                                    >
                                        Rollback
                                    </button>
                                )}
                                <button
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(row, null, 2))}
                                    className="text-green-700"
                                >
                                    Copy JSON
                                </button>
                            </div>
                        ),
                    },
                ]}
                data={data}
            />
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
