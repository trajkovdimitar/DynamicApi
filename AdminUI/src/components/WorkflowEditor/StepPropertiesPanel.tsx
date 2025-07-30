import StepParameterEditor from './StepParameterEditor';
import type { WorkflowStep } from '../../types/models';
import { stepTypes } from '../../types/models';

interface Props {
    step: WorkflowStep;
    index: number;
    onChange: (updatedStep: WorkflowStep) => void;
}

export default function StepPropertiesPanel({ step, onChange }: Props) {
    const update = (partial: Partial<WorkflowStep>) => onChange({ ...step, ...partial });

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step Details</h3>
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
            <input
                className="border rounded p-2 w-full dark:bg-neutral-800"
                placeholder="Condition (C# expression)"
                value={step.condition ?? ''}
                onChange={(e) => update({ condition: e.target.value })}
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
            <StepParameterEditor step={step} onChange={onChange} />
        </div>
    );
}
