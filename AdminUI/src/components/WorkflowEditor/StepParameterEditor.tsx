import type { WorkflowStep, Parameter } from '../../types/models';
import { valueTypes } from '../../types/models';
import { Button } from '../common/Button';
import Input from '../common/Input';

interface Props {
  step: WorkflowStep;
  onChange: (step: WorkflowStep) => void;
}

export default function StepParameterEditor({ step, onChange }: Props) {
  const updateParam = (i: number, partial: Partial<Parameter>) => {
    const list = [...(step.parameters ?? [])];
    list[i] = { ...list[i], ...partial } as Parameter;
    onChange({ ...step, parameters: list });
  };

  const addParam = () => {
    onChange({
      ...step,
      parameters: [...(step.parameters ?? []), { key: '', value: '', valueType: 'string' }],
    });
  };

  const removeParam = (i: number) => {
    const list = (step.parameters ?? []).filter((_, idx) => idx !== i);
    onChange({ ...step, parameters: list });
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Parameters</h4>
      {step.parameters?.map((p, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2 items-end">
          <Input
            placeholder="Key"
            value={p.key}
            onChange={(e) => updateParam(idx, { key: e.target.value })}
          />
          <select
            className="border rounded p-2 dark:bg-neutral-800"
            value={p.valueType}
            onChange={(e) => updateParam(idx, { valueType: e.target.value as any })}
          >
            {valueTypes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <Input
            placeholder="Value"
            value={p.value}
            onChange={(e) => updateParam(idx, { value: e.target.value })}
          />
          <Button variant="danger" onClick={() => removeParam(idx)}>
            Delete
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addParam}>
        Add Parameter
      </Button>
    </div>
  );
}
