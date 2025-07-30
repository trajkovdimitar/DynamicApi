import { useEffect, useState } from 'react';
import { stepTypes, valueTypes, workflowEvents } from '../types/models';
import { getModels } from '../services/models';
import type { WorkflowDefinition, WorkflowStep, Parameter } from '../types/models';
import Input from './common/Input';
import { Button } from './common/Button';

const stepDescriptions: Record<string, string> = {
    CreateEntity: 'Create a new record for the selected model.',
    UpdateEntity: 'Update an existing record by id.',
    QueryEntity: 'Query records using a filter expression.',
    SendEmail: 'Send an email using the configured provider.',
};

export const defaultParams: Record<string, Parameter[]> = {
    CreateEntity: [
        { key: 'ModelName', valueType: 'string', value: '' },
        { key: 'Mappings', valueType: 'json', value: '[]' },
    ],
    UpdateEntity: [
        { key: 'ModelName', valueType: 'string', value: '' },
        { key: 'Id', valueType: 'string', value: '' },
        { key: 'Mappings', valueType: 'json', value: '[]' },
    ],
    QueryEntity: [
        { key: 'ModelName', valueType: 'string', value: '' },
        { key: 'Filter', valueType: 'string', value: '' },
    ],
    SendEmail: [
        { key: 'To', valueType: 'string', value: '' },
        { key: 'Subject', valueType: 'string', value: '' },
        { key: 'Body', valueType: 'string', value: '' },
    ],
};

interface Props {
    workflow: WorkflowDefinition;
    onChange: (wf: WorkflowDefinition) => void;
}

export default function WorkflowEditorForm({ workflow, onChange }: Props) {
    const [expanded, setExpanded] = useState<number[]>(workflow.steps.map((_, i) => i));
    const [models, setModels] = useState<string[]>([]);
    const eventInfo = (() => {
        const parts = workflow.workflowName.split('.');
        if (parts.length === 2 && (workflowEvents as readonly string[]).includes(parts[1])) {
            return `Runs ${parts[1]} on ${parts[0]}`;
        }
        return '';
    })();

    useEffect(() => {
        getModels().then(list => setModels(list.map(m => m.modelName))).catch(console.error);
    }, []);
    const updateStep = (index: number, partial: Partial<WorkflowStep>) => {
        const steps = [...workflow.steps];
        const current = { ...steps[index] } as WorkflowStep;
        const next = { ...current, ...partial } as WorkflowStep;
        if (partial.type && partial.type !== current.type) {
            next.parameters = JSON.parse(JSON.stringify(defaultParams[partial.type] || []));
        }
        steps[index] = next;
        onChange({ ...workflow, steps });
    };

    const addStep = () => {
        onChange({
            ...workflow,
            steps: [
                ...workflow.steps,
                {
                    type: stepTypes[0],
                    parameters: JSON.parse(JSON.stringify(defaultParams[stepTypes[0]])),
                    condition: '',
                    onError: '',
                    outputVariable: '',
                },
            ],
        });
    };

    const duplicateStep = (index: number) => {
        const steps = [...workflow.steps];
        const copy = JSON.parse(JSON.stringify(steps[index])) as WorkflowStep;
        steps.splice(index + 1, 0, copy);
        onChange({ ...workflow, steps });
    };

    const moveStep = (index: number, delta: number) => {
        const steps = [...workflow.steps];
        const target = index + delta;
        if (target < 0 || target >= steps.length) return;
        const [item] = steps.splice(index, 1);
        steps.splice(target, 0, item);
        onChange({ ...workflow, steps });
    };

    const toggleStep = (index: number) => {
        setExpanded(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
        );
    };

    const removeStep = (index: number) => {
        if (!confirm('Delete this step?')) return;
        const steps = workflow.steps.filter((_, i) => i !== index);
        onChange({ ...workflow, steps });
    };

    const updateParameter = (
        stepIndex: number,
        paramIndex: number,
        partial: Partial<Parameter>,
    ) => {
        const steps = [...workflow.steps];
        const step = { ...steps[stepIndex] } as WorkflowStep;
        const list = [...(step.parameters ?? [])];
        list[paramIndex] = { ...list[paramIndex], ...partial } as Parameter;
        step.parameters = list;
        steps[stepIndex] = step;
        onChange({ ...workflow, steps });
    };

    const addParameter = (stepIndex: number) => {
        const steps = [...workflow.steps];
        const step = { ...steps[stepIndex] } as WorkflowStep;
        step.parameters = [
            ...(step.parameters ?? []),
            { key: '', valueType: valueTypes[0], value: '' },
        ];
        steps[stepIndex] = step;
        onChange({ ...workflow, steps });
    };

    const removeParameter = (stepIndex: number, paramIndex: number) => {
        const steps = [...workflow.steps];
        const step = { ...steps[stepIndex] } as WorkflowStep;
        step.parameters = step.parameters?.filter((_, i) => i !== paramIndex) ?? [];
        steps[stepIndex] = step;
        onChange({ ...workflow, steps });
    };

    const updateGlobalVariable = (index: number, partial: Partial<Parameter>) => {
        const list = [...workflow.globalVariables];
        list[index] = { ...list[index], ...partial } as Parameter;
        onChange({ ...workflow, globalVariables: list });
    };

    const addGlobalVariable = () => {
        onChange({
            ...workflow,
            globalVariables: [
                ...workflow.globalVariables,
                { key: '', valueType: valueTypes[0], value: '' },
            ],
        });
    };

    const removeGlobalVariable = (index: number) => {
        if (!confirm('Delete variable?')) return;
        const list = workflow.globalVariables.filter((_, i) => i !== index);
        onChange({ ...workflow, globalVariables: list });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <label className="mb-1 text-sm">Workflow Name</label>
                <Input
                    placeholder="e.g. OrderProcessing"
                    value={workflow.workflowName}
                    onChange={e => onChange({ ...workflow, workflowName: e.target.value })}
                />
                {eventInfo && (
                    <p className="text-xs text-neutral-500 mt-1">{eventInfo}</p>
                )}
            </div>
            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={workflow.isTransactional}
                    onChange={e => onChange({ ...workflow, isTransactional: e.target.checked })}
                />
                Transactional
            </label>
            <div className="space-y-2">
                <h3 className="font-semibold">Global Variables</h3>
                {workflow.globalVariables.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Key"
                            value={p.key}
                            onChange={e => updateGlobalVariable(idx, { key: e.target.value })}
                        />
                        <select
                            className="border rounded p-2 dark:bg-neutral-800"
                            value={p.valueType}
                            onChange={e => updateGlobalVariable(idx, { valueType: e.target.value as any })}
                        >
                            {valueTypes.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Value"
                            value={p.value}
                            onChange={e => updateGlobalVariable(idx, { value: e.target.value })}
                        />
                        <Button variant="danger" onClick={() => removeGlobalVariable(idx)}>
                            Delete
                        </Button>
                    </div>
                ))}
                <Button variant="secondary" onClick={addGlobalVariable}>Add Variable</Button>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Steps</h3>
                {workflow.steps.length === 0 && (
                    <p className="text-sm text-neutral-500">No steps added.</p>
                )}
                {workflow.steps.map((s, idx) => (
                    <div key={idx} className="border p-2 rounded space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-medium cursor-pointer" onClick={() => toggleStep(idx)}>
                                {expanded.includes(idx) ? '▼' : '►'} Step {idx + 1} - {s.type}
                            </span>
                            <div className="space-x-2">
                                <button className="text-xs" onClick={() => moveStep(idx, -1)}>Up</button>
                                <button className="text-xs" onClick={() => moveStep(idx, 1)}>Down</button>
                                <button className="text-xs" onClick={() => duplicateStep(idx)}>Copy</button>
                                <Button variant="danger" onClick={() => removeStep(idx)}>Delete</Button>
                            </div>
                        </div>
                        {expanded.includes(idx) && (
                            <>
                                <select
                            className="border rounded p-2 dark:bg-neutral-800"
                            value={s.type}
                            onChange={e => updateStep(idx, { type: e.target.value })}
                        >
                            {stepTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <p className="text-xs text-neutral-500">{stepDescriptions[s.type]}</p>
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Condition (optional)"
                            value={s.condition ?? ''}
                            onChange={e => updateStep(idx, { condition: e.target.value })}
                        />
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="On Error policy"
                            value={s.onError ?? ''}
                            onChange={e => updateStep(idx, { onError: e.target.value })}
                        />
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Output Variable name"
                            value={s.outputVariable ?? ''}
                            onChange={e => updateStep(idx, { outputVariable: e.target.value })}
                        />
                                <div className="space-y-1">
                                    <h4 className="font-medium">Parameters</h4>
                                    {s.parameters?.map((p, pIdx) => (
                                        <div key={pIdx} className="grid grid-cols-4 gap-2 items-end">
                                            <input
                                                className="border rounded p-2 dark:bg-neutral-800"
                                                placeholder="Key"
                                                value={p.key}
                                                onChange={e => updateParameter(idx, pIdx, { key: e.target.value })}
                                            />
                                            <select
                                                className="border rounded p-2 dark:bg-neutral-800"
                                                value={p.valueType}
                                                onChange={e => updateParameter(idx, pIdx, { valueType: e.target.value as any })}
                                            >
                                                {valueTypes.map(v => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
                                            </select>
                                            {p.key === 'ModelName' ? (
                                                <select
                                                    className="border rounded p-2 dark:bg-neutral-800"
                                                    value={p.value}
                                                    onChange={e => updateParameter(idx, pIdx, { value: e.target.value })}
                                                >
                                                    <option value="">Select model</option>
                                                    {models.map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                            ) : p.key === 'Mappings' ? (
                                                <textarea
                                                    className="border rounded p-2 dark:bg-neutral-800 h-24"
                                                    placeholder="JSON"
                                                    value={p.value}
                                                    onChange={e => updateParameter(idx, pIdx, { value: e.target.value })}
                                                />
                                            ) : (
                                                <input
                                                    className="border rounded p-2 dark:bg-neutral-800"
                                                    placeholder="Value"
                                                    value={p.value}
                                                    onChange={e => updateParameter(idx, pIdx, { value: e.target.value })}
                                                />
                                            )}
                                            <Button variant="danger" onClick={() => removeParameter(idx, pIdx)}>
                                                Delete
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="secondary" onClick={() => addParameter(idx)}>
                                        Add Parameter
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={addStep}>Add Step</Button>
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(JSON.stringify(workflow, null, 2))}>
                        Copy JSON
                    </Button>
                </div>
            </div>
        </div>
    );
}
