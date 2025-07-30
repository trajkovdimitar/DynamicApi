import StepParameterEditor from './StepParameterEditor';
import StepExpressionEditor from './StepExpressionEditor';
import type { WorkflowStep } from '../../types/models';
import { stepTypes } from '../../types/models';
import { defaultParams } from './defaultParams';

interface Props {
    step: WorkflowStep;
    index: number;
    onChange: (updatedStep: WorkflowStep) => void;
}

export default function StepPropertiesPanel({ step, onChange }: Props) {
    const update = (partial: Partial<WorkflowStep>) => {
        let next = { ...step, ...partial } as WorkflowStep;
        if (partial.type && partial.type !== step.type) {
            next.parameters = JSON.parse(JSON.stringify(defaultParams[partial.type] || []));
        }
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step Details</h3>

            <select
                className="border rounded p-2 w-full"
                value={step.type}
                onChange={e => update({ type: e.target.value })}
            >
                {stepTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>

            <StepExpressionEditor
                value={step.condition ?? ''}
                onChange={val => update({ condition: val })}
                suggestions={["Vars.", "Input.", "Workflow."]}
            />

            <input
                className="border rounded p-2 w-full"
                placeholder="OnError (e.g. Retry:3)"
                value={step.onError ?? ''}
                onChange={e => update({ onError: e.target.value })}
            />

            <input
                className="border rounded p-2 w-full"
                placeholder="Output Variable"
                value={step.outputVariable ?? ''}
                onChange={e => update({ outputVariable: e.target.value })}
            />

            <StepParameterEditor step={step} onChange={onChange} />
        </div>
    );
}
