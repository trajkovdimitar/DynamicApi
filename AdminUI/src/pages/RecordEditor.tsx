import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getModels } from '../services/models';
import { getRecord, saveRecord, updateRecord } from '../services/data';
import type { ModelDefinition } from '../types/models';
import { FormFieldBuilder } from '../components/FormFieldBuilder';

export default function RecordEditor() {
    const { name, id } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState<ModelDefinition | null>(null);
    const [values, setValues] = useState<Record<string, unknown>>({});

    useEffect(() => {
        if (!name) return;
        getModels()
            .then(list => {
                const m = list.find(mm => mm.modelName === name);
                setModel(m || null);
                if (m && id && id !== 'new') {
                    getRecord(name, id).then(setValues).catch(console.error);
                }
            })
            .catch(console.error);
    }, [name, id]);

    const save = async () => {
        if (!name) return;
        if (id && id !== 'new') {
            await updateRecord(name, id, values);
        } else {
            await saveRecord(name, values);
        }
        navigate(`/data/${name}`);
    };

    if (!model) return <div>Loading...</div>;

    const fields = model.properties.map(p => ({ name: p.name, label: p.name, type: 'text' }));

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{id === 'new' ? 'New' : 'Edit'} {name}</h2>
            <FormFieldBuilder fields={fields} values={values} onChange={(n, v) => setValues({ ...values, [n]: v })} />
            <button onClick={save} className="px-3 py-1 rounded bg-blue-600 text-white">
                Save
            </button>
        </div>
    );
}
