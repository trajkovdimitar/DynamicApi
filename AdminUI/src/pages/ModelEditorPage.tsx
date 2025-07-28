import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveModel, getModels } from '../services/models';
import type {
    ModelDefinition,
    PropertyDefinition,
    RelationshipDefinition,
} from '../types/models';

export default function ModelEditorPage() {
    const { name } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState<ModelDefinition>({
        modelName: name === 'new' || !name ? '' : name,
        properties: [],
        relationships: [],
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

    const addRelationship = () => {
        setModel(m => ({
            ...m,
            relationships: [
                ...m.relationships,
                {
                    relationshipType: '',
                    targetModel: '',
                    navigationName: '',
                    foreignKey: '',
                    inverseNavigation: '',
                },
            ],
        }));
    };

    const updateRelationship = (
        index: number,
        rel: Partial<RelationshipDefinition>,
    ) => {
        const list = [...model.relationships];
        list[index] = { ...list[index], ...rel } as RelationshipDefinition;
        setModel({ ...model, relationships: list });
    };

    const save = async () => {
        await saveModel(model);
        navigate('/models');
    };

    return (
        <div>
            <h2>{name === 'new' ? 'New Model' : `Edit ${name}`}</h2>
            <div>
                <div>
                    <label>Model Name</label>
                    <input
                       
                        value={model.modelName}
                        onChange={e => setModel({ ...model, modelName: e.target.value })}
                    />
                </div>
                {model.properties.map((p, idx) => (
                    <div key={idx}>
                        <input
                           
                            placeholder="Name"
                            value={p.name}
                            onChange={e => updateField(idx, { name: e.target.value })}
                        />
                        <input
                           
                            placeholder="Type"
                            value={p.type}
                            onChange={e => updateField(idx, { type: e.target.value })}
                        />
                        <label>
                            Key
                            <input
                                type="checkbox"
                                checked={!!p.isKey}
                                onChange={e => updateField(idx, { isKey: e.target.checked })}
                            />
                        </label>
                        <label>
                            Required
                            <input
                                type="checkbox"
                                checked={!!p.isRequired}
                                onChange={e => updateField(idx, { isRequired: e.target.checked })}
                            />
                        </label>
                        <input
                           
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
                <button onClick={addField}>
                    Add Field
                </button>
            </div>
            <div>
                <h3>Relationships</h3>
                {model.relationships.map((r, idx) => (
                    <div key={idx}>
                        <input
                           
                            placeholder="Type"
                            value={r.relationshipType}
                            onChange={e => updateRelationship(idx, { relationshipType: e.target.value })}
                        />
                        <input
                           
                            placeholder="Target Model"
                            value={r.targetModel}
                            onChange={e => updateRelationship(idx, { targetModel: e.target.value })}
                        />
                        <input
                           
                            placeholder="Navigation Name"
                            value={r.navigationName}
                            onChange={e => updateRelationship(idx, { navigationName: e.target.value })}
                        />
                        <input
                           
                            placeholder="Foreign Key"
                            value={r.foreignKey}
                            onChange={e => updateRelationship(idx, { foreignKey: e.target.value })}
                        />
                        <input
                           
                            placeholder="Inverse Navigation"
                            value={r.inverseNavigation}
                            onChange={e => updateRelationship(idx, { inverseNavigation: e.target.value })}
                        />
                    </div>
                ))}
                <button onClick={addRelationship}>
                    Add Relationship
                </button>
            </div>
            <button onClick={save}>
                Save
            </button>
        </div>
    );
}

