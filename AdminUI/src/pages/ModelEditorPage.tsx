import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveModel, getModels } from '../services/models';
import type { ModelDefinition, PropertyDefinition } from '../types/models';

export default function ModelEditorPage() {
    const { name } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState<ModelDefinition>({
        modelName: name === 'new' || !name ? '' : name,
        properties: [],
    });

    useEffect(() => {
        if (name && name !== 'new') {
            getModels()
                .then(list => {
                    const found = list.find(m => m.modelName === name);
                    if (found) setModel(found);
                })
                .catch(console.error);
        }
    }, [name]);

    const addField = () => {
        setModel(m => ({ ...m, properties: [...m.properties, { name: '', type: 'string' }] }));
    };

    const updateField = (index: number, field: Partial<PropertyDefinition>) => {
        const props = [...model.properties];
        props[index] = { ...props[index], ...field } as PropertyDefinition;
        setModel({ ...model, properties: props });
    };

    const save = async () => {
        await saveModel(model);
        navigate('/models');
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{name === 'new' ? 'New Model' : `Edit ${name}`}</h2>
            <div className="space-y-2">
                <div className="flex flex-col">
                    <label className="mb-1 text-sm">Model Name</label>
                    <input
                        className="border rounded p-2 dark:bg-neutral-800"
                        value={model.modelName}
                        onChange={e => setModel({ ...model, modelName: e.target.value })}
                    />
                </div>
                {model.properties.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2 items-end">
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Name"
                            value={p.name}
                            onChange={e => updateField(idx, { name: e.target.value })}
                        />
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Type"
                            value={p.type}
                            onChange={e => updateField(idx, { type: e.target.value })}
                        />
                        <label className="flex items-center gap-1">
                            Key
                            <input
                                type="checkbox"
                                checked={!!p.isKey}
                                onChange={e => updateField(idx, { isKey: e.target.checked })}
                            />
                        </label>
                        <label className="flex items-center gap-1">
                            Required
                            <input
                                type="checkbox"
                                checked={!!p.isRequired}
                                onChange={e => updateField(idx, { isRequired: e.target.checked })}
                            />
                        </label>
                        <input
                            className="border rounded p-2 dark:bg-neutral-800"
                            placeholder="Max Length"
                            value={p.maxLength ?? ''}
                            onChange={e =>
                                updateField(idx, {
                                    maxLength: e.target.value ? parseInt(e.target.value) : null,
                                })
                            }
                        />
                    </div>
                ))}
                <button onClick={addField} className="px-3 py-1 rounded bg-gray-300 dark:bg-neutral-700">
                    Add Field
                </button>
            </div>
            <button onClick={save} className="px-3 py-1 rounded bg-blue-600 text-white">
                Save
            </button>
        </div>
    );
}
