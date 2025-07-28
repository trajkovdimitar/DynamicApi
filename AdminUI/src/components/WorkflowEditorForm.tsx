import { useEffect, useState } from 'react';
import { stepTypes, valueTypes, workflowEvents } from '../types/models';
import { getModels } from '../services/models';
import type { WorkflowDefinition, WorkflowStep, Parameter } from '../types/models';

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
        <div>
            <div>
                <label>Workflow Name</label>
                <input
                   
                    placeholder="e.g. OrderProcessing"
                    value={workflow.workflowName}
                    onChange={e => onChange({ ...workflow, workflowName: e.target.value })}
                />
                {eventInfo && (
                    <p>{eventInfo}</p>
                )}
            </div>
            <label>
                <input
                    type="checkbox"
                    checked={workflow.isTransactional}
                    onChange={e => onChange({ ...workflow, isTransactional: e.target.checked })}
                />
                Transactional
            </label>
            <div>
                <h3>Global Variables</h3>
                {workflow.globalVariables.map((p, idx) => (
                    <div key={idx}>
                        <input
                           
                            placeholder="Key"
                            value={p.key}
                            onChange={e => updateGlobalVariable(idx, { key: e.target.value })}
                        />
                        <select
                           
                            value={p.valueType}
                            onChange={e => updateGlobalVariable(idx, { valueType: e.target.value as any })}
                        >
                            {valueTypes.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                        <input
                           
                            placeholder="Value"
                            value={p.value}
                            onChange={e => updateGlobalVariable(idx, { value: e.target.value })}
                        />
                        <button onClick={() => removeGlobalVariable(idx)}>Delete</button>
                    </div>
                ))}
                <button onClick={addGlobalVariable}>
                    Add Variable
                </button>
            </div>
            <div>
                <h3>Steps</h3>
                {workflow.steps.length === 0 && (
                    <p>No steps added.</p>
                )}
                {workflow.steps.map((s, idx) => (
                    <div key={idx}>
                        <div>
                            <span onClick={() => toggleStep(idx)}>
                                {expanded.includes(idx) ? '▼' : '►'} Step {idx + 1} - {s.type}
                            </span>
                            <div>
                                <button onClick={() => moveStep(idx, -1)}>Up</button>
                                <button onClick={() => moveStep(idx, 1)}>Down</button>
                                <button onClick={() => duplicateStep(idx)}>Copy</button>
                                <button onClick={() => removeStep(idx)}>Delete</button>
                            </div>
                        </div>
                        {expanded.includes(idx) && (
                            <>
                                <select
                           
                            value={s.type}
                            onChange={e => updateStep(idx, { type: e.target.value })}
                        >
                            {stepTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <p>{stepDescriptions[s.type]}</p>
                        <input
                           
                            placeholder="Condition (optional)"
                            value={s.condition ?? ''}
                            onChange={e => updateStep(idx, { condition: e.target.value })}
                        />
                        <input
                           
                            placeholder="On Error policy"
                            value={s.onError ?? ''}
                            onChange={e => updateStep(idx, { onError: e.target.value })}
                        />
                        <input
                           
                            placeholder="Output Variable name"
                            value={s.outputVariable ?? ''}
                            onChange={e => updateStep(idx, { outputVariable: e.target.value })}
                        />
                                <div>
                                    <h4>Parameters</h4>
                                    {s.parameters?.map((p, pIdx) => (
                                        <div key={pIdx}>
                                            <input
                                               
                                                placeholder="Key"
                                                value={p.key}
                                                onChange={e => updateParameter(idx, pIdx, { key: e.target.value })}
                                            />
                                            <select
                                               
                                                value={p.valueType}
                                                onChange={e => updateParameter(idx, pIdx, { valueType: e.target.value as any })}
                                            >
                                                {valueTypes.map(v => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
                                            </select>
                                            {p.key === 'ModelName' ? (
                                                <select
                                                   
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
                                                   
                                                    placeholder="JSON"
                                                    value={p.value}
                                                    onChange={e => updateParameter(idx, pIdx, { value: e.target.value })}
                                                />
                                            ) : (
                                                <input
                                                   
                                                    placeholder="Value"
                                                    value={p.value}
                                                    onChange={e => updateParameter(idx, pIdx, { value: e.target.value })}
                                                />
                                            )}
                                            <button onClick={() => removeParameter(idx, pIdx)}>Delete</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addParameter(idx)}>
                                        Add Parameter
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                <div>
                    <button onClick={addStep}>Add Step</button>
                    <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(workflow, null, 2))}
                       
                    >
                        Copy JSON
                    </button>
                </div>
            </div>
        </div>
    );
}
