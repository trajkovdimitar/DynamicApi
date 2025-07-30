import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveModel, getModels } from '../services/models';
import Input from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Breadcrumb } from '../components/Breadcrumb';
import Select from '../components/form/Select';
import Checkbox from '../components/form/input/Checkbox';
import Alert from '../components/ui/alert/Alert';
import { PlusIcon } from '../components/ui/icons';
import type { ModelDefinition, PropertyDefinition, RelationshipDefinition } from '../types/models';
import RelationshipEditorRow from '../components/RelationshipEditorRow';

const PROPERTY_TYPES = ['string', 'int', 'float', 'boolean', 'datetime', 'text', 'binary'];

export default function ModelEditorPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState<ModelDefinition>({
    modelName: name === 'new' || !name ? '' : name,
    properties: [],
    relationships: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    getModels()
      .then(list => {
        setAvailableModels(list.map(m => m.modelName).filter(m => m !== name));
        if (name && name !== 'new') {
          const found = list.find(m => m.modelName === name);
          if (found) setModel(found);
        }
      })
      .catch(err => {
        console.error(err);
        setGlobalError('Failed to load existing models.');
      });
  }, [name]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!model.modelName.trim()) {
      newErrors.modelName = 'Model name is required.';
    }
    model.properties.forEach((p, idx) => {
      if (!p.name.trim()) newErrors[`prop_${idx}_name`] = 'Field name is required.';
      if (!p.type) newErrors[`prop_${idx}_type`] = 'Field type is required.';
    });

    const navNames = new Set<string>();
    model.relationships.forEach((r, idx) => {
      if (!r.relationshipType) newErrors[`rel_${idx}_type`] = 'Relationship type is required.';
      if (!r.targetModel) newErrors[`rel_${idx}_target`] = 'Target model is required.';
      if (!r.navigationName.trim()) newErrors[`rel_${idx}_nav`] = 'Navigation name is required.';
      if (navNames.has(r.navigationName)) {
        newErrors[`rel_${idx}_nav`] = 'Navigation name must be unique.';
      } else {
        navNames.add(r.navigationName);
      }
      if (r.relationshipType === 'many-to-many' && r.foreignKey) {
        newErrors[`rel_${idx}_fk`] = 'Foreign key not needed for many-to-many.';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const updateField = (index: number, field: Partial<PropertyDefinition>) => {
    const props = [...model.properties];
    props[index] = { ...props[index], ...field };
    setModel({ ...model, properties: props });
  };

  const removeField = (index: number) => {
    setModel(m => ({ ...m, properties: m.properties.filter((_, i) => i !== index) }));
  };

  const updateRelationship = (index: number, rel: Partial<RelationshipDefinition>) => {
    const list = [...model.relationships];
    list[index] = { ...list[index], ...rel };
    setModel({ ...model, relationships: list });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Models', href: '/models' }, { label: name === 'new' ? 'New Model' : model.modelName }]} />
      <h2 className="text-2xl font-bold">{name === 'new' ? 'Create New Model' : `Edit Model: ${model.modelName}`}</h2>

      {globalError && <Alert title='' variant='error' message={globalError} />}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Model Details</h3>
        <div className="flex flex-col space-y-1">
          <label htmlFor="modelName" className="text-sm font-medium">Model Name</label>
          <Input
            id="modelName"
            value={model.modelName}
            onChange={e => setModel({ ...model, modelName: e.target.value })}
            placeholder="e.g., User"
            error={!!errors.modelName}
          />
          {errors.modelName && <p className="text-sm text-red-600">{errors.modelName}</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Fields</h3>
          <Button variant="secondary" size="sm" onClick={() => setModel(m => ({ ...m, properties: [...m.properties, { name: '', type: 'string', isKey: false, isRequired: false, maxLength: null }] }))} startIcon={<PlusIcon />}>Add Field</Button>
        </div>
        {model.properties.map((p, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-b-0">
            <div className="col-span-3">
              <Input
                placeholder="Field Name"
                value={p.name}
                onChange={e => {
                  const props = [...model.properties];
                  props[idx] = { ...props[idx], name: e.target.value };
                  setModel({ ...model, properties: props });
                }}
                error={!!errors[`prop_${idx}_name`]}
              />
              {errors[`prop_${idx}_name`] && <p className="text-sm text-red-600">{errors[`prop_${idx}_name`]}</p>}
            </div>
            <div className="col-span-3">
              <Select
                defaultValue={p.type}
                onChange={val => {
                  const props = [...model.properties];
                  props[idx] = { ...props[idx], type: val };
                  setModel({ ...model, properties: props });
                }}
                options={PROPERTY_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
              />
              {errors[`prop_${idx}_type`] && <p className="text-sm text-red-600">{errors[`prop_${idx}_type`]}</p>}
            </div>
            <div className="col-span-2">
              <Checkbox label="Primary Key" checked={!!p.isKey} onChange={val => updateField(idx, { isKey: val })} />
            </div>
            <div className="col-span-2">
              <Checkbox label="Required" checked={!!p.isRequired} onChange={val => updateField(idx, { isRequired: val })} />
            </div>
            <div className="col-span-1">
              <Input
                type="number"
                placeholder="Max Len"
                value={p.maxLength ?? ''}
                onChange={e => updateField(idx, { maxLength: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
            <div className="col-span-1">
              <Button variant="ghost" size="sm" onClick={() => removeField(idx)} aria-label="Remove field">🗑</Button>
            </div>
          </div>
        ))}
        {model.properties.length === 0 && <p className="text-gray-500">No fields added yet.</p>}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Relationships</h3>
          <Button variant="secondary" size="sm" onClick={() => setModel(m => ({ ...m, relationships: [...m.relationships, { relationshipType: '', targetModel: '', navigationName: '', foreignKey: '', inverseNavigation: '' }] }))} startIcon={<PlusIcon />}>Add Relationship</Button>
        </div>
        {model.relationships.map((r, idx) => (
          <RelationshipEditorRow
            key={idx}
            index={idx}
            currentModelName={model.modelName}
            relationship={r}
            availableModels={availableModels}
            errors={errors}
            onUpdate={updateRelationship}
            onRemove={i => setModel(m => ({ ...m, relationships: m.relationships.filter((_, j) => j !== i) }))}
          />
        ))}
        {model.relationships.length === 0 && <p className="text-gray-500">No relationships added yet.</p>}
      </section>

      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={() => navigate('/models')}>Cancel</Button>
        <Button onClick={async () => {
          if (!validate()) return;
          setIsSaving(true);
          try {
            await saveModel(model);
            navigate('/models');
          } catch (err) {
            console.error(err);
            setGlobalError('Failed to save model. Please check your inputs.');
          } finally {
            setIsSaving(false);
          }
        }} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Model'}</Button>
      </div>
    </div>
  );
}
