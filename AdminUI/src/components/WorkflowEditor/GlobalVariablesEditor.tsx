import type { WorkflowDefinition, Parameter } from '../../types/models';
import { valueTypes } from '../../types/models';
import { Button } from '../common/Button';

interface Props {
    workflow: WorkflowDefinition;
    onChange: (workflow: WorkflowDefinition) => void;
}

export default function GlobalVariablesEditor({ workflow, onChange }: Props) {
    const updateVar = (i: number, partial: Partial<Parameter>) => {
        const list = [...workflow.globalVariables];
        list[i] = { ...list[i], ...partial } as Parameter;
        onChange({ ...workflow, globalVariables: list });
    };

    const addVar = () => {
        onChange({
            ...workflow,
            globalVariables: [...workflow.globalVariables, { key: '', value: '', valueType: 'string' }],
        });
    };

    const removeVar = (i: number) => {
        const list = workflow.globalVariables.filter((_, idx) => idx !== i);
        onChange({ ...workflow, globalVariables: list });
    };

    return (
        <div className="space-y-2 mb-4">
            <h3 className="font-semibold">Global Variables</h3>
            {workflow.globalVariables.map((p, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                    <input
                        className="border rounded p-2 w-full dark:bg-neutral-800"
                        placeholder="Key"
                        value={p.key}
                        onChange={(e) => updateVar(idx, { key: e.target.value })}
                    />
                    <select
                        className="border rounded p-2 w-full dark:bg-neutral-800"
                        value={p.valueType}
                        onChange={(e) => updateVar(idx, { valueType: e.target.value as any })}
                    >
                        {valueTypes.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                    <input
                        className="border rounded p-2 w-full dark:bg-neutral-800"
                        placeholder="Value"
                        value={p.value}
                        onChange={(e) => updateVar(idx, { value: e.target.value })}
                    />
                    <Button variant="danger" onClick={() => removeVar(idx)}>
                        Delete
                    </Button>
                </div>
            ))}
            <Button variant="secondary" onClick={addVar}>
                Add Variable
            </Button>
        </div>
    );
}
