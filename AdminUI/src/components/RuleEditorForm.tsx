import { Rule, Workflow } from '../types/models';
import Input from './common/Input';
import { Button } from './common/Button';

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
                <Input
                    value={workflow.workflowName}
                    onChange={e => onChange({ ...workflow, workflowName: e.target.value })}
                />
            </div>
            {workflow.rules.map((r, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                    <Input
                        placeholder="Rule Name"
                        value={r.ruleName}
                        onChange={e => updateRule(idx, { ruleName: e.target.value })}
                    />
                    <Input
                        placeholder="Expression"
                        list="exprSuggestions"
                        value={r.expression ?? ''}
                        onChange={e => updateRule(idx, { expression: e.target.value })}
                    />
                    <Input
                        placeholder="Error Message"
                        value={r.errorMessage ?? ''}
                        onChange={e => updateRule(idx, { errorMessage: e.target.value })}
                    />
                    <Button variant="danger" onClick={() => removeRule(idx)}>
                        Delete
                    </Button>
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
