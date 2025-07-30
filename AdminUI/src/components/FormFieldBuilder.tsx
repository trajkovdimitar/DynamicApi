import Input from './common/Input';

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

export function FormFieldBuilder({ fields, values, onChange }: Props) {
    return (
        <div className="space-y-4">
            {fields.map(f => (
                <div key={f.name} className="flex flex-col">
                    <label className="mb-1 text-sm">{f.label}</label>
                    <Input
                        type={f.type}
                        value={(values[f.name] as string) || ''}
                        onChange={e => onChange(f.name, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}
