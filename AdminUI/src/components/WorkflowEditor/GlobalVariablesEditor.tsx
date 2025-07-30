import type { WorkflowDefinition, Parameter } from '../../types/models';
import { valueTypes } from '../../types/models';
import { Button } from '../common/Button';
import Input from '../common/Input';

interface Props {
  workflow: WorkflowDefinition;
  onChange: (wf: WorkflowDefinition) => void;
}

export default function GlobalVariablesEditor({ workflow, onChange }: Props) {
  const updateVariable = (i: number, partial: Partial<Parameter>) => {
    const vars = [...workflow.globalVariables];
    vars[i] = { ...vars[i], ...partial } as Parameter;
    onChange({ ...workflow, globalVariables: vars });
  };

  const addVariable = () => {
    onChange({
      ...workflow,
      globalVariables: [...workflow.globalVariables, { key: '', value: '', valueType: 'string' }],
    });
  };

  const removeVariable = (i: number) => {
    const vars = workflow.globalVariables.filter((_, idx) => idx !== i);
    onChange({ ...workflow, globalVariables: vars });
  };

  return (
    <div className="space-y-2 mb-4">
      <h3 className="font-semibold">Global Variables</h3>
      {workflow.globalVariables.map((v, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2 items-end">
          <Input
            placeholder="Key"
            value={v.key}
            onChange={(e) => updateVariable(idx, { key: e.target.value })}
          />
          <select
            className="border rounded p-2 dark:bg-neutral-800"
            value={v.valueType}
            onChange={(e) => updateVariable(idx, { valueType: e.target.value as any })}
          >
            {valueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Input
            placeholder="Value"
            value={v.value}
            onChange={(e) => updateVariable(idx, { value: e.target.value })}
          />
          <Button variant="danger" onClick={() => removeVariable(idx)}>
            Delete
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addVariable}>
        Add Variable
      </Button>
    </div>
  );
}
