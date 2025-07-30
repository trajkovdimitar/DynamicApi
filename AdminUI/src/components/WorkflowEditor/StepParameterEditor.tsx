import type { WorkflowStep, Parameter } from '../../types/models';
import { valueTypes } from '../../types/models';
import { Button } from '../common/Button';
import ExpressionEditor from './ExpressionEditor';
import MappingsEditor from './MappingsEditor';

interface Props {
    step: WorkflowStep;
    onChange: (step: WorkflowStep) => void;
    completions: string[];
}

export default function StepParameterEditor({ step, onChange, completions }: Props) {
    const update = (idx: number, partial: Partial<Parameter>) => {
        const list = [...step.parameters];
        list[idx] = { ...list[idx], ...partial } as Parameter;
        onChange({ ...step, parameters: list });
    };

    const add = () => {
        onChange({
            ...step,
            parameters: [...step.parameters, { key: '', value: '', valueType: 'string' }],
        });
    };

    const remove = (idx: number) => {
        onChange({
            ...step,
            parameters: step.parameters.filter((_, i) => i !== idx),
        });
    };

    return (
        <div className="space-y-2">
            <h4 className="font-medium">Parameters</h4>
            {step.parameters.map((p, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-start">
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        placeholder="Key"
                        value={p.key}
                        onChange={(e) => update(idx, { key: e.target.value })}
                    />
                    <select
                        className="border rounded p-2 dark:bg-neutral-800"
                        value={p.valueType}
                        onChange={(e) => update(idx, { valueType: e.target.value as any })}
                    >
                        {valueTypes.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                    {p.key === 'Mappings' && p.valueType === 'json' ? (
                        <MappingsEditor
                            value={p.value}
                            onChange={(val) => update(idx, { value: val })}
                            completions={completions}
                        />
                    ) : (
                        <ExpressionEditor
                            value={p.value}
                            onChange={(val) => update(idx, { value: val })}
                            completions={completions}
                        />
                    )}
                    <Button variant="danger" onClick={() => remove(idx)}>
                        Delete
                    </Button>
                </div>
            ))}
            <Button variant="secondary" onClick={add}>
                Add Parameter
            </Button>
        </div>
    );
}
