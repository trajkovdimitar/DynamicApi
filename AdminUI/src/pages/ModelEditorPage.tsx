import { useEffect, useState, useMemo } from 'react';  // Added useMemo for optimization
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
import axios from 'axios';  // For API calls

// Inline Loader stub (move to ui/Loader.tsx if preferred)
const Loader = () => (
  <div className="flex justify-center items-center h-32">
    <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

export default function ModelEditorPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState<ModelDefinition>({
    modelName: name === 'new' || !name ? '' : name,
    properties: [],
    relationships: [],
    ignoreMissingRelationships: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);  // Fetched from API

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const modelsList = await getModels();
        setAvailableModels(modelsList.map((m: ModelDefinition) => m.modelName).filter((m: string) => m !== name));

        // Fetch built-in types
        const typesResponse = await axios.get('https://localhost:7020/api/models/types');
        setPropertyTypes(typesResponse.data.data || []);

        if (name && name !== 'new') {
          const found = modelsList.find((m: ModelDefinition) => m.modelName === name);
          if (found) setModel(found);
        }
      } catch (err) {
        console.error(err);
        setGlobalError('Failed to load data. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [name]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!model.modelName.trim()) newErrors.modelName = 'Model name is required.';

    model.properties.forEach((p, idx) => {
      if (!p.name.trim()) newErrors[`prop_${idx}_name`] = 'Field name is required.';
      if (!p.type) newErrors[`prop_${idx}_type`] = 'Field type is required.';
      if (p.type === 'FileAsset' && (!p.allowedExtensions || p.allowedExtensions.length === 0)) {
        newErrors[`prop_${idx}_extensions`] = 'Specify allowed extensions for FileAsset.';
      }
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

  const addField = () => {
    setModel((m) => ({
      ...m,
      properties: [...m.properties, { name: '', type: 'String', isKey: false, isRequired: false, maxLength: null, allowedExtensions: [] }],
    }));
  };

  const updateField = (index: number, field: Partial<PropertyDefinition>) => {
    const props = [...model.properties];
    props[index] = { ...props[index], ...field };
    setModel({ ...model, properties: props });
  };

  const removeField = (index: number) => {
    setModel((m) => ({ ...m, properties: m.properties.filter((_, i) => i !== index) }));
  };

  const addRelationship = () => {
    setModel((m) => ({
      ...m,
      relationships: [...m.relationships, { relationshipType: '', targetModel: '', navigationName: '', foreignKey: '', inverseNavigation: '' }],
    }));
  };

  const updateRelationship = (index: number, rel: Partial<RelationshipDefinition>) => {
    const list = [...model.relationships];
    list[index] = { ...list[index], ...rel };
    setModel({ ...model, relationships: list });
  };

  const removeRelationship = (index: number) => {
    setModel((m) => ({ ...m, relationships: m.relationships.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
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
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 p-4">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Models', href: '/models' }, { label: name === 'new' ? 'New Model' : model.modelName }]} />
      <h2 className="text-2xl font-bold">{name === 'new' ? 'Create New Model' : `Edit Model: ${model.modelName}`}</h2>

      {globalError && <Alert title="Error" variant="error" message={globalError} />}

      <section className="space-y-4" aria-labelledby="model-details">
        <h3 id="model-details" className="text-lg font-semibold">Model Details</h3>
        <div className="flex flex-col space-y-1">
          <label htmlFor="modelName" className="text-sm font-medium">Model Name</label>
          <Input
            id="modelName"
            value={model.modelName}
            onChange={(e) => setModel({ ...model, modelName: e.target.value })}
            placeholder="e.g., User"
            error={!!errors.modelName}
            aria-invalid={!!errors.modelName}
            aria-describedby={errors.modelName ? "modelName-error" : undefined}
          />
          {errors.modelName && <p id="modelName-error" className="text-sm text-red-600">{errors.modelName}</p>}
        </div>
        <Checkbox
          label="Ignore Missing Relationships"
          checked={model.ignoreMissingRelationships ?? false}  // Fixed: Ensure boolean
          onChange={(val) => setModel({ ...model, ignoreMissingRelationships: val })}
        />
      </section>

      <section className="space-y-4" aria-labelledby="fields-section">
        <div className="flex items-center justify-between">
          <h3 id="fields-section" className="text-lg font-semibold">Fields</h3>
          <Button variant="secondary" size="sm" onClick={addField} startIcon={<PlusIcon />} aria-label="Add Field">Add Field</Button>
        </div>
        {model.properties.map((p, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-b-0">
            <div className="col-span-3">
              <Input
                placeholder="Field Name"
                value={p.name}
                onChange={(e) => updateField(idx, { name: e.target.value })}
                error={!!errors[`prop_${idx}_name`]}
                aria-invalid={!!errors[`prop_${idx}_name`]}
                aria-describedby={errors[`prop_${idx}_name`] ? `prop_${idx}_name-error` : undefined}
              />
              {errors[`prop_${idx}_name`] && <p id={`prop_${idx}_name-error`} className="text-sm text-red-600">{errors[`prop_${idx}_name`]}</p>}
            </div>
            <div className="col-span-3">
              <Select
                value={p.type}
                onChange={(val) => updateField(idx, { type: val })}
                options={propertyTypes.map(t => ({ value: t, label: t }))}
                error={!!errors[`prop_${idx}_type`]}
                aria-invalid={!!errors[`prop_${idx}_type`]}
                aria-describedby={errors[`prop_${idx}_type`] ? `prop_${idx}_type-error` : undefined}
              />
              {errors[`prop_${idx}_type`] && <p id={`prop_${idx}_type-error`} className="text-sm text-red-600">{errors[`prop_${idx}_type`]}</p>}
            </div>
            <div className="col-span-2">
              <Checkbox label="Primary Key" checked={!!p.isKey} onChange={(val) => updateField(idx, { isKey: val })} />
            </div>
            <div className="col-span-2">
              <Checkbox label="Required" checked={!!p.isRequired} onChange={(val) => updateField(idx, { isRequired: val })} />
            </div>
            <div className="col-span-1">
              <Input
                type="number"
                placeholder="Max Len"
                value={p.maxLength ?? ''}
                onChange={(e) => updateField(idx, { maxLength: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
            <div className="col-span-1">
              <Button variant="ghost" size="sm" onClick={() => removeField(idx)} aria-label="Remove field">🗑</Button>
            </div>
            {p.type === 'FileAsset' && (
              <div className="col-span-12 mt-2">
                <Input
                  placeholder="Allowed Extensions (comma-separated, e.g., .jpg,.png)"
                  value={p.allowedExtensions?.join(',') ?? ''}
                  onChange={(e) => updateField(idx, { allowedExtensions: e.target.value.split(',').map(ext => ext.trim()) })}
                  error={!!errors[`prop_${idx}_extensions`]}
                  aria-invalid={!!errors[`prop_${idx}_extensions`]}
                  aria-describedby={errors[`prop_${idx}_extensions`] ? `prop_${idx}_extensions-error` : undefined}
                />
                {errors[`prop_${idx}_extensions`] && <p id={`prop_${idx}_extensions-error`} className="text-sm text-red-600">{errors[`prop_${idx}_extensions`]}</p>}
              </div>
            )}
          </div>
        ))}
        {model.properties.length === 0 && <p className="text-gray-500">No fields added yet.</p>}
      </section>

      <section className="space-y-4" aria-labelledby="relationships-section">
        <div className="flex items-center justify-between">
          <h3 id="relationships-section" className="text-lg font-semibold">Relationships</h3>
          <Button variant="secondary" size="sm" onClick={addRelationship} startIcon={<PlusIcon />} aria-label="Add Relationship">Add Relationship</Button>
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
            onRemove={removeRelationship}
          />
        ))}
        {model.relationships.length === 0 && <p className="text-gray-500">No relationships added yet.</p>}
      </section>

      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={() => navigate('/models')} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving || isLoading} aria-busy={isSaving}>
          {isSaving ? 'Saving...' : 'Save Model'}
        </Button>
      </div>
    </div>
  );
}