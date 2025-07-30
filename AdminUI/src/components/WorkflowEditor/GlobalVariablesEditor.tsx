import type { WorkflowDefinition, Parameter } from '../../types/models';
import { valueTypes } from '../../types/models';
import { Button } from '../common/Button';

interface Props {
    workflow: WorkflowDefinition;
    onChange: (wf: WorkflowDefinition) => void;
}

export default function GlobalVariablesEditor({ workflow, onChange }: Props) {
    const update = (index: number, partial: Partial<Parameter>) => {
        const vars = [...workflow.globalVariables];
        vars[index] = { ...vars[index], ...partial } as Parameter;
        onChange({ ...workflow, globalVariables: vars });
    };

    const add = () => {
        onChange({
            ...workflow,
            globalVariables: [...workflow.globalVariables, { key: '', value: '', valueType: 'string' }],
        });
    };

    const remove = (index: number) => {
        onChange({
            ...workflow,
            globalVariables: workflow.globalVariables.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="space-y-2 mb-4">
            <h3 className="font-semibold">Global Variables</h3>
            {workflow.globalVariables.map((v, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        placeholder="Key"
                        value={v.key}
                        onChange={(e) => update(idx, { key: e.target.value })}
                    />
                    <select
                        className="border rounded p-2 dark:bg-neutral-800"
                        value={v.valueType}
                        onChange={(e) => update(idx, { valueType: e.target.value as any })}
                    >
                        {valueTypes.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        placeholder="Value"
                        value={v.value}
                        onChange={(e) => update(idx, { value: e.target.value })}
                    />
                    <Button variant="danger" onClick={() => remove(idx)}>
                        Delete
                    </Button>
                </div>
            ))}
            <Button variant="secondary" onClick={add}>
                Add Variable
            </Button>
        </div>
    );
}
