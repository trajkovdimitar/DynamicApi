import { useEffect } from 'react';
import type { WorkflowStep } from '../../types/models';
import { stepTypes } from '../../types/models';
import StepParameterEditor from './StepParameterEditor';
import ExpressionEditor from './ExpressionEditor';
import { getDefaultParams } from './utils';

interface Props {
    step: WorkflowStep;
    index: number;
    onChange: (step: WorkflowStep) => void;
    availableCompletions: string[];
    workflowName: string;
}

export default function StepPropertiesPanel({ step, onChange, availableCompletions, workflowName }: Props) {
    const modelName = workflowName.split('.')[0] ?? '';

    const update = (partial: Partial<WorkflowStep>) => {
        let next = { ...step, ...partial } as WorkflowStep;
        if (partial.type && partial.type !== step.type) {
            next = { ...next, parameters: getDefaultParams(partial.type, modelName) };
        } else {
            next.parameters = next.parameters.map(p => {
                if (p.key === 'ModelName' && !p.value) return { ...p, value: modelName };
                if (next.type === 'UpdateEntity' && p.key === 'Id' && !p.value) return { ...p, value: '{{ Input.Id }}' };
                return p;
            });
        }
        onChange(next);
    };

    useEffect(() => {
        const adjusted = step.parameters.map(p => {
            if (p.key === 'ModelName' && !p.value) return { ...p, value: modelName };
            if (step.type === 'UpdateEntity' && p.key === 'Id' && !p.value) return { ...p, value: '{{ Input.Id }}' };
            return p;
        });
        if (JSON.stringify(adjusted) !== JSON.stringify(step.parameters)) {
            onChange({ ...step, parameters: adjusted });
        }
    }, [modelName, step, onChange]);


    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step {step.type}</h3>
            <select
                className="border rounded p-2 w-full dark:bg-neutral-800"
                value={step.type}
                onChange={(e) => update({ type: e.target.value })}
            >
                {stepTypes.map((t) => (
                    <option key={t} value={t}>
                        {t}
                    </option>
                ))}
            </select>
            <ExpressionEditor
                value={step.condition ?? ''}
                onChange={(val) => update({ condition: val })}
                completions={availableCompletions}
            />
            <input
                className="border rounded p-2 w-full dark:bg-neutral-800"
                placeholder="OnError (e.g. Retry:3)"
                value={step.onError ?? ''}
                onChange={(e) => update({ onError: e.target.value })}
            />
            <input
                className="border rounded p-2 w-full dark:bg-neutral-800"
                placeholder="Output Variable"
                value={step.outputVariable ?? ''}
                onChange={(e) => update({ outputVariable: e.target.value })}
            />
            <StepParameterEditor step={step} onChange={onChange} completions={availableCompletions} />
        </div>
    );
}
