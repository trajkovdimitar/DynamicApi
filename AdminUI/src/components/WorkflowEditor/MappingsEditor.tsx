import { Button } from '../common/Button';
import ExpressionEditor from './ExpressionEditor';

interface Mapping {
    key: string;
    value: string;
}

interface Props {
    value: string;
    onChange: (val: string) => void;
    completions: string[];
}

export default function MappingsEditor({ value, onChange, completions }: Props) {
    let maps: Mapping[] = [];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) maps = parsed as Mapping[];
    } catch {
        maps = [];
    }

    const update = (idx: number, partial: Partial<Mapping>) => {
        const next = [...maps];
        next[idx] = { ...next[idx], ...partial } as Mapping;
        onChange(JSON.stringify(next));
    };

    const add = () => {
        onChange(JSON.stringify([...maps, { key: '', value: '' }]));
    };

    const remove = (idx: number) => {
        onChange(JSON.stringify(maps.filter((_, i) => i !== idx)));
    };

    return (
        <div className="space-y-2">
            {maps.map((m, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 items-start">
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        placeholder="Property"
                        value={m.key}
                        onChange={(e) => update(idx, { key: e.target.value })}
                    />
                    <ExpressionEditor
                        value={m.value}
                        onChange={(val) => update(idx, { value: val })}
                        completions={completions}
                    />
                    <Button variant="danger" onClick={() => remove(idx)}>
                        Delete
                    </Button>
                </div>
            ))}
            <Button variant="secondary" onClick={add}>Add Mapping</Button>
        </div>
    );
}
