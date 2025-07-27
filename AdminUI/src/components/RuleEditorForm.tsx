import { Rule, Workflow } from '../types/models';
import { Button } from './Button';

interface Props {
    workflow: Workflow;
    onChange: (wf: Workflow) => void;
    suggestions: string[];
}

export function RuleEditorForm({ workflow, onChange, suggestions }: Props) {
    const updateRule = (index: number, partial: Partial<Rule>) => {
        const newRules = [...workflow.rules];
        newRules[index] = { ...newRules[index], ...partial };
        onChange({ ...workflow, rules: newRules });
    };

    const addRule = () => {
        onChange({
            ...workflow,
            rules: [...workflow.rules, { ruleName: '', expression: '', errorMessage: '' }],
        });
    };

    const removeRule = (index: number) => {
        const newRules = workflow.rules.filter((_, i) => i !== index);
        onChange({ ...workflow, rules: newRules });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col">
                <label className="mb-1 text-sm">Workflow Name</label>
                <input
                    className="border rounded p-2 dark:bg-neutral-800"
                    value={workflow.workflowName}
                    onChange={e => onChange({ ...workflow, workflowName: e.target.value })}
                />
            </div>
            {workflow.rules.map((r, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        placeholder="Rule Name"
                        value={r.ruleName}
                        onChange={e => updateRule(idx, { ruleName: e.target.value })}
                    />
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        placeholder="Expression"
                        list="exprSuggestions"
                        value={r.expression ?? ''}
                        onChange={e => updateRule(idx, { expression: e.target.value })}
                    />
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        placeholder="Error Message"
                        value={r.errorMessage ?? ''}
                        onChange={e => updateRule(idx, { errorMessage: e.target.value })}
                    />
                    <button
                        className="text-red-600"
                        onClick={() => removeRule(idx)}
                    >
                        Delete
                    </button>
                </div>
            ))}
            <datalist id="exprSuggestions">
                {suggestions.map(s => (
                    <option key={s} value={`entity.${s}`} />
                ))}
            </datalist>
            <Button variant="secondary" onClick={addRule}>Add Rule</Button>
        </div>
    );
}
