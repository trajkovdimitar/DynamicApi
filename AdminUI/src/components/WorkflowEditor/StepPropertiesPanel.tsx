import type { WorkflowStep, Parameter } from '../../types/models';
import { stepTypes } from '../../types/models';
import StepParameterEditor from './StepParameterEditor';
import ExpressionEditor from './ExpressionEditor';

const defaultParams: Record<string, Parameter[]> = {
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
    step: WorkflowStep;
    index: number;
    onChange: (step: WorkflowStep) => void;
    availableCompletions: string[];
}

export default function StepPropertiesPanel({ step, onChange, availableCompletions }: Props) {
    const update = (partial: Partial<WorkflowStep>) => {
        let next = { ...step, ...partial } as WorkflowStep;
        if (partial.type && partial.type !== step.type) {
            next = { ...next, parameters: JSON.parse(JSON.stringify(defaultParams[partial.type] || [])) };
        }
        onChange(next);
    };

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
