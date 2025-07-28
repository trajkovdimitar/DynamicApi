import { Rule, Workflow } from '../types/models';
import styled from 'styled-components';

interface Props {
    workflow: Workflow;
    onChange: (wf: Workflow) => void;
    suggestions: string[];
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: ${({ theme }) => theme.spacing.sm};
    align-items: end;
`;

const Input = styled.input`
    padding: ${({ theme }) => theme.spacing.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.background};
`;

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
        <Container>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '4px', fontSize: '0.875rem' }}>Workflow Name</label>
                <Input
                    value={workflow.workflowName}
                    onChange={e => onChange({ ...workflow, workflowName: e.target.value })}
                />
            </div>
            {workflow.rules.map((r, idx) => (
                <Row key={idx}>
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
                    <button style={{ color: 'red' }} onClick={() => removeRule(idx)}>
                        Delete
                    </button>
                </Row>
            ))}
            <datalist id="exprSuggestions">
                {suggestions.map(s => (
                    <option key={s} value={`entity.${s}`} />
                ))}
            </datalist>
            <button onClick={addRule}>Add Rule</button>
        </Container>
    );
}
