import { useState } from 'react';
import { stepTypes, valueTypes } from '../types/models';
import type { WorkflowDefinition, WorkflowStep, Parameter } from '../types/models';

interface Props {
    workflow: WorkflowDefinition;
    onChange: (wf: WorkflowDefinition) => void;
}

export default function WorkflowEditorForm({ workflow, onChange }: Props) {
    const [expanded, setExpanded] = useState<number[]>(workflow.steps.map((_, i) => i));
    const updateStep = (index: number, partial: Partial<WorkflowStep>) => {
        const steps = [...workflow.steps];
        steps[index] = { ...steps[index], ...partial } as WorkflowStep;
        onChange({ ...workflow, steps });
    };

    const addStep = () => {
        onChange({
            ...workflow,
            steps: [
                ...workflow.steps,
                { type: stepTypes[0], parameters: [], condition: '', onError: '', outputVariable: '' },
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
        const list = workflow.globalVariables.filter((_, i) => i !== index);
        onChange({ ...workflow, globalVariables: list });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <label className="mb-1 text-sm">Workflow Name</label>
                <input
                    className="border rounded p-2 dark:bg-neutral-800"
                    value={workflow.workflowName}
                    onChange={e => onChange({ ...workflow, workflowName: e.target.value })}
                />
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
                        <button className="text-red-600" onClick={() => removeGlobalVariable(idx)}>Delete</button>
                    </div>
                ))}
                <button onClick={addGlobalVariable} className="px-3 py-1 rounded bg-gray-300 dark:bg-neutral-700">
                    Add Variable
                </button>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Steps</h3>
                {workflow.steps.map((s, idx) => (
                    <div key={idx} className="border p-2 rounded space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-medium cursor-pointer" onClick={() => toggleStep(idx)}>
                                {expanded.includes(idx) ? '▼' : '►'} Step {idx + 1}
                            </span>
                            <div className="space-x-2">
                                <button className="text-xs" onClick={() => moveStep(idx, -1)}>Up</button>
                                <button className="text-xs" onClick={() => moveStep(idx, 1)}>Down</button>
                                <button className="text-xs" onClick={() => duplicateStep(idx)}>Copy</button>
                                <button className="text-red-600" onClick={() => removeStep(idx)}>Delete</button>
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
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Condition"
                            value={s.condition ?? ''}
                            onChange={e => updateStep(idx, { condition: e.target.value })}
                        />
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="On Error"
                            value={s.onError ?? ''}
                            onChange={e => updateStep(idx, { onError: e.target.value })}
                        />
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Output Variable"
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
                                            <input
                                                className="border rounded p-2 dark:bg-neutral-800"
                                                placeholder="Value"
                                                value={p.value}
                                                onChange={e => updateParameter(idx, pIdx, { value: e.target.value })}
                                            />
                                            <button className="text-red-600" onClick={() => removeParameter(idx, pIdx)}>Delete</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addParameter(idx)} className="px-3 py-1 rounded bg-gray-300 dark:bg-neutral-700">
                                        Add Parameter
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                <div className="flex gap-2">
                    <button onClick={addStep} className="px-3 py-1 rounded bg-gray-300 dark:bg-neutral-700">Add Step</button>
                    <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(workflow, null, 2))}
                        className="px-3 py-1 rounded bg-gray-300 dark:bg-neutral-700"
                    >
                        Copy JSON
                    </button>
                </div>
            </div>
        </div>
    );
}
