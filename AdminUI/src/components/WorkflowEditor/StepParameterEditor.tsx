import type { WorkflowStep, Parameter } from '../../types/models';
import { valueTypes } from '../../types/models';
import { Button } from '../common/Button';
import StepExpressionEditor from './StepExpressionEditor';

interface Props {
    step: WorkflowStep;
    onChange: (updatedStep: WorkflowStep) => void;
}

export default function StepParameterEditor({ step, onChange }: Props) {
    const updateParam = (i: number, partial: Partial<Parameter>) => {
        const list = [...step.parameters];
        list[i] = { ...list[i], ...partial } as Parameter;
        onChange({ ...step, parameters: list });
    };

    const addParam = () => {
        onChange({
            ...step,
            parameters: [...step.parameters, { key: '', value: '', valueType: 'string' }]
        });
    };

    const removeParam = (i: number) => {
        const list = step.parameters.filter((_, idx) => idx !== i);
        onChange({ ...step, parameters: list });
    };

    return (
        <div className="space-y-2">
            <h4 className="font-medium">Parameters</h4>
            {step.parameters.map((p, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                    <input
                        className="border rounded p-2"
                        placeholder="Key"
                        value={p.key}
                        onChange={e => updateParam(idx, { key: e.target.value })}
                    />
                    <select
                        className="border rounded p-2"
                        value={p.valueType}
                        onChange={e => updateParam(idx, { valueType: e.target.value as any })}
                    >
                        {valueTypes.map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <StepExpressionEditor
                        value={p.value}
                        onChange={(val) => updateParam(idx, { value: val })}
                        suggestions={["Vars.", "Input.", "Workflow."]}
                    />
                    <Button variant="danger" onClick={() => removeParam(idx)}>Delete</Button>
                </div>
            ))}
            <Button variant="secondary" onClick={addParam}>Add Parameter</Button>
        </div>
    );
}
