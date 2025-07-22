interface Field {
    name: string;
    label: string;
    type: string;
}

interface Props {
    fields: Field[];
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
}

export function FormFieldBuilder({ fields, values, onChange }: Props) {
    return (
        <div className="space-y-4">
            {fields.map(f => (
                <div key={f.name} className="flex flex-col">
                    <label className="mb-1 text-sm">{f.label}</label>
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        type={f.type}
                        value={values[f.name] ?? ''}
                        onChange={e => onChange(f.name, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}
