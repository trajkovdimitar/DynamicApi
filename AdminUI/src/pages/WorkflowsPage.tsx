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
import WorkflowEditor from '../components/WorkflowEditor/WorkflowEditor';
import { defaultParams } from '../components/WorkflowEditor/defaultParams';
import Skeleton from '../components/common/Skeleton';
import { Modal } from '../components/Modal';
import { Button } from '../components/common/Button';
import Input from '../components/common/Input';
import { Breadcrumb } from '../components/Breadcrumb';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/common/Table';

export default function WorkflowsPage() {
  const queryClient = useQueryClient();
  const {
    data: items,
    isLoading,
    refetch,
  } = useQuery<WorkflowDefinition[]>({ queryKey: ['workflows'], queryFn: getWorkflows });

  const { data: models } = useQuery<ModelDefinition[]>({
    queryKey: ['models'],
    queryFn: getModels,
  });

  const [editing, setEditing] = useState<WorkflowDefinition | null>(null);
  const [original, setOriginal] = useState<WorkflowDefinition | null>(null);
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState('');
  const [sortField, setSortField] = useState<'name' | 'version'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [confirmRollback, setConfirmRollback] = useState<{ name: string; version: number } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<typeof workflowEvents[number]>(workflowEvents[0]);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const pageSize = 10;

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

  const hasChanges = editing && original && JSON.stringify(editing) !== JSON.stringify(original);
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
    if (sortField === 'name') return a.workflowName.localeCompare(b.workflowName) * dir;
    return ((a.version ?? 1) - (b.version ?? 1)) * dir;
  });

  const data = filtered.map((w, idx) => ({ ...w, idx }));
  const totalPages = Math.ceil(data.length / pageSize);
  const pageData = data.slice((page - 1) * pageSize, page * pageSize);

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
      <div className="space-y-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Workflows' }]} />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="space-x-2">
            <Button onClick={() => setNewModalOpen(true)} size="sm" title="Create new workflow">
              New
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Reload workflows">
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <>
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
          </>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-start font-medium text-gray-500 dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-start font-medium text-gray-500 dark:text-gray-400 cursor-pointer" onClick={() => toggleSort('name')}>
                      Name{sortField === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-start font-medium text-gray-500 dark:text-gray-400 cursor-pointer" onClick={() => toggleSort('version')}>
                      Version{sortField === 'version' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-start font-medium text-gray-500 dark:text-gray-400">
                      Steps
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-start font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {pageData.map(row => (
                    <TableRow key={row.workflowName}>
                      <TableCell className="px-5 py-4 text-start">{row.idx + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white/90">
                        {row.workflowName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white/90">
                        {row.version ?? 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white/90">
                        {row.steps.length}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start space-x-2">
                        <Button size="sm" onClick={() => openEditor(row.workflowName)}>Edit</Button>
                        {row.version && row.version > 1 && (
                          <Button variant="danger" size="sm" onClick={() => setConfirmRollback({ name: row.workflowName, version: row.version! - 1 })}>
                            Rollback
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(row, null, 2))}>
                          Copy JSON
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <span className="self-center text-sm">{page} / {totalPages}</span>
            <Button size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        )}

        {editing && (
          <div className="space-y-4 mt-4 p-4 border border-gray-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-white/[0.03] shadow-sm">
            {hasChanges && (
              <p className="text-sm text-orange-600">You have unsaved changes.</p>
            )}
            <WorkflowEditor workflow={editing} onChange={setEditing} selectedStepIndex={selectedStepIndex} setSelectedStepIndex={setSelectedStepIndex} />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={reset}>Reset</Button>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={() => editing && save(editing)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Toast message={toast} onClose={() => setToast('')} />

      <Modal open={newModalOpen} onClose={() => setNewModalOpen(false)}>
        <div className="space-y-4 w-64">
          <h3 className="text-lg font-semibold">New Workflow</h3>
          <select className="border rounded p-2 w-full dark:bg-neutral-800" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
            <option value="">Select model</option>
            {models?.map(m => <option key={m.modelName} value={m.modelName}>{m.modelName}</option>)}
          </select>
          <select className="border rounded p-2 w-full dark:bg-neutral-800" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value as any)}>
            {workflowEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNewModalOpen(false)}>Cancel</Button>
            <Button disabled={!selectedModel} onClick={() => {
              if (!selectedModel) return;
              startNewWorkflow(`${selectedModel}.${selectedEvent}`);
              setNewModalOpen(false);
            }}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmRollback} onClose={() => setConfirmRollback(null)}>
        <div className="space-y-4 w-64">
          <h3 className="text-lg font-semibold">Confirm Rollback</h3>
          <p>Are you sure you want to rollback this workflow?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmRollback(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => {
              if (!confirmRollback) return;
              rollbackWorkflow(confirmRollback.name, confirmRollback.version).then(() => {
                setConfirmRollback(null);
                refetch();
              });
            }}>Rollback</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
