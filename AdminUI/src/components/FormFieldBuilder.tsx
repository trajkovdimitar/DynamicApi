import styled from 'styled-components';

interface Field {
    name: string;
    label: string;
    type: string;
}

interface Props {
    fields: Field[];
    values: Record<string, unknown>;
    onChange: (name: string, value: unknown) => void;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
`;

const FieldWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const Input = styled.input`
    padding: ${({ theme }) => theme.spacing.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.background};
`;

export function FormFieldBuilder({ fields, values, onChange }: Props) {
    return (
        <Container>
            {fields.map(f => (
                <FieldWrapper key={f.name}>
                    <label style={{ marginBottom: '4px', fontSize: '0.875rem' }}>{f.label}</label>
                    <Input
                        type={f.type}
                        value={(values[f.name] as string) || ''}
                        onChange={e => onChange(f.name, e.target.value)}
                    />
                </FieldWrapper>
            ))}
        </Container>
    );
}
