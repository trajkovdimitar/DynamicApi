import { useState } from 'react';
import {
    getWorkflows,
    getWorkflow,
    saveWorkflow,
    rollbackWorkflow,
} from '../services/workflows';
import { getModels } from '../services/models';
import type { WorkflowDefinition, ModelDefinition } from '../types/models';
import { stepTypes, workflowEvents } from '../types/models';
import Toast from '../components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WorkflowEditorForm, { defaultParams } from '../components/WorkflowEditorForm';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';

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
    const [newModalOpen, setNewModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<(typeof workflowEvents)[number]>(workflowEvents[0]);

    const { data: models } = useQuery<ModelDefinition[]>({
        queryKey: ['models'],
        queryFn: getModels,
    });

    const saveMutation = useMutation<void, Error, WorkflowDefinition>({
        mutationFn: saveWorkflow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            setToast('Workflow saved');
        },
        onError: () => setToast('Failed to save workflow'),
    });

    const startNewWorkflow = (name: string) => {
        const def: WorkflowDefinition = {
            workflowName: name,
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
    };

    const openEditor = async (name: string | null) => {
        if (!name) return;
        const wf = await getWorkflow(name);
        setOriginal(wf);
        setEditing(JSON.parse(JSON.stringify(wf)));
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
        <div>
            <h2>Workflows</h2>
            <div>
                <input
                   
                    placeholder="Search workflows"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <div>
                    <button onClick={() => setNewModalOpen(true)}>
                        New Workflow
                    </button>
                    <button onClick={() => refetch()}>
                        Refresh
                    </button>
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
                            <div>
                                <button onClick={() => openEditor(row.workflowName)}>Edit</button>
                                {row.version && row.version > 1 && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Rollback to previous version?'))
                                                rollbackWorkflow(row.workflowName, row.version! - 1).then(() => refetch());
                                        }}
                                       
                                    >
                                        Rollback
                                    </button>
                                )}
                                <button
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(row, null, 2))}
                                   
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
                <div>
                    {hasChanges && (
                        <p>You have unsaved changes.</p>
                    )}
                    <WorkflowEditorForm workflow={editing} onChange={setEditing} />
                    <div>
                        <button onClick={reset}>Reset</button>
                        <button onClick={cancelEdit}>Cancel</button>
                        <button
                            onClick={() => editing && save(editing)}
                           
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}
        </div>
        <Toast message={toast} onClose={() => setToast('')} />
        <Modal open={newModalOpen} onClose={() => setNewModalOpen(false)}>
            <div>
                <h3>New Workflow</h3>
                <select
                   
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                >
                    <option value="">Select model</option>
                    {models?.map(m => (
                        <option key={m.modelName} value={m.modelName}>
                            {m.modelName}
                        </option>
                    ))}
                </select>
                <select
                   
                    value={selectedEvent}
                    onChange={e => setSelectedEvent(e.target.value as any)}
                >
                    {workflowEvents.map(ev => (
                        <option key={ev} value={ev}>
                            {ev}
                        </option>
                    ))}
                </select>
                <div>
                    <button onClick={() => setNewModalOpen(false)}>
                        Cancel
                    </button>
                    <button
                        disabled={!selectedModel}
                       
                        onClick={() => {
                            if (!selectedModel) return;
                            startNewWorkflow(`${selectedModel}.${selectedEvent}`);
                            setNewModalOpen(false);
                        }}
                    >
                        Create
                    </button>
                </div>
            </div>
        </Modal>
        </>
    );
}
