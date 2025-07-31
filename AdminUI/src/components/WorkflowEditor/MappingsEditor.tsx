import { useMemo } from 'react';

interface Props {
    value: string;
    onChange: (v: string) => void;
    requiredFields?: string[];
}

export default function MappingsEditor({ value, onChange, requiredFields = [] }: Props) {
    const mappings = useMemo(() => {
        try {
            return JSON.parse(value) as any[];
        } catch {
            return [] as any[];
        }
    }, [value]);

    const unmapped = requiredFields.filter(f => {
        const match = mappings.find(m => m.To === f);
        if (!match) return true;
        if (match.Value !== undefined && String(match.Value).trim() !== '') return false;
        if (match.From !== undefined && String(match.From).trim() !== '') return false;
        return true;
    });

    return (
        <div className="space-y-1">
            <textarea
                className={`border rounded p-2 dark:bg-neutral-800 h-24 ${unmapped.length ? 'border-red-500' : ''}`}
                placeholder="JSON"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            {unmapped.length > 0 && (
                <p className="text-xs text-red-600">Missing mappings: {unmapped.join(', ')}</p>
            )}
        </div>
    );
}
