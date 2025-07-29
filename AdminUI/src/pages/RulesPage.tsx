import { useEffect, useState } from 'react';
import { getWorkflows, saveWorkflow } from '../services/rules';
import { getModels } from '../services/models';
import type { Workflow } from '../types/models';
import { RuleEditorForm } from '../components/RuleEditorForm';
import Skeleton from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { Breadcrumb } from '../components/Breadcrumb';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/common/Table';

export default function RulesPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'rules'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Rules' }]} />
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <Button onClick={() => startEdit()} size="sm" title="Create new rule">New</Button>
            <Button variant="outline" size="sm" onClick={loadWorkflows} title="Reload rules">Refresh</Button>
          </div>
        </div>
        <Skeleton height="2rem" />
        <Skeleton height="2rem" />
        <Skeleton height="2rem" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Rules' }]} />
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Rules' }]} />

      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <Button onClick={() => startEdit()} size="sm" title="Create new rule">New</Button>
          <Button variant="outline" size="sm" onClick={loadWorkflows} title="Reload rules">Refresh</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                  onClick={() => toggleSort('name')}
                >
                  Name{sortField === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                  onClick={() => toggleSort('rules')}
                >
                  Rules{sortField === 'rules' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-4 text-center" colSpan={3}>
                    No rules found.
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((wf) => (
                  <TableRow key={wf.workflowName} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-start">
                      {wf.workflowName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-start">
                      {wf.rules.length}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-start">
                      <Button size="sm" onClick={() => startEdit(wf)} title="Edit rule">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
        <div className="space-y-2 mt-4 p-4 border border-gray-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-white/[0.03] shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {editing.workflowName ? `Editing: ${editing.workflowName}` : 'New Workflow'}
          </h3>
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
