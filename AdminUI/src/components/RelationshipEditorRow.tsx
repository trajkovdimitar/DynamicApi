import Input from '../components/common/Input';
import Select from '../components/form/Select';
import { Button } from '../components/common/Button';
import { TrashBinIcon } from '../components/ui/icons';
import type { RelationshipDefinition } from '../types/models';
import React from 'react';  // Explicit for hooks

interface Props {
  index: number;
  currentModelName: string;
  relationship: RelationshipDefinition;
  availableModels: string[];
  errors: Record<string, string>;
  onUpdate: (index: number, changes: Partial<RelationshipDefinition>) => void;
  onRemove: (index: number) => void;
}

const RELATIONSHIP_TYPES = ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'] as const;

export default function RelationshipEditorRow({
  index,
  currentModelName,
  relationship,
  availableModels,
  errors,
  onUpdate,
  onRemove,
}: Props) {
  const update = (changes: Partial<RelationshipDefinition>) => onUpdate(index, changes);

  const handleTargetChange = (val: string) => {
    const navName = relationship.navigationName || `${val}${relationship.relationshipType?.includes('many') ? 's' : ''}`;
    const fkSuggestion = relationship.foreignKey || `${val}Id`;
    const inverseNav = `${currentModelName}${relationship.relationshipType?.includes('many') ? 's' : ''}`;
    update({ targetModel: val, navigationName: navName, foreignKey: fkSuggestion, inverseNavigation: inverseNav });
  };

  const handleTypeChange = (val: string) => {
    const navName = `${relationship.targetModel}${val.includes('many') ? 's' : ''}`;
    const inverseNav = `${currentModelName}${val.includes('many') ? 's' : ''}`;
    update({ relationshipType: val, navigationName: navName, inverseNavigation: inverseNav });
  };

  // Memoize options for performance (availableModels can be large)
  const relationshipTypeOptions = React.useMemo(() => RELATIONSHIP_TYPES.map(t => ({
    value: t,
    label: t.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
  })), []);

  const modelOptions = React.useMemo(() => availableModels.map(m => ({
    value: m,
    label: m,
    disabled: m === currentModelName,
  })), [availableModels, currentModelName]);

  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-b-0" aria-labelledby={`relationship-${index}-header`}>
      <div className="col-span-2">
        <Select
          value={relationship.relationshipType}
          onChange={handleTypeChange}
          options={relationshipTypeOptions}
          placeholder="Type"
          error={!!errors[`rel_${index}_type`]}
          aria-invalid={!!errors[`rel_${index}_type`]}
          aria-describedby={errors[`rel_${index}_type`] ? `rel_${index}_type-error` : undefined}
        />
        {errors[`rel_${index}_type`] && <p id={`rel_${index}_type-error`} className="text-sm text-red-600 mt-1">{errors[`rel_${index}_type`]}</p>}
      </div>
      <div className="col-span-2">
        <Select
          value={relationship.targetModel}
          onChange={handleTargetChange}
          options={modelOptions}
          placeholder="Target Model"
          error={!!errors[`rel_${index}_target`]}
          aria-invalid={!!errors[`rel_${index}_target`]}
          aria-describedby={errors[`rel_${index}_target`] ? `rel_${index}_target-error` : undefined}
        />
        {errors[`rel_${index}_target`] && <p id={`rel_${index}_target-error`} className="text-sm text-red-600 mt-1">{errors[`rel_${index}_target`]}</p>}
      </div>
      <div className="col-span-2">
        <Input
          placeholder="Navigation Name"
          value={relationship.navigationName}
          onChange={e => update({ navigationName: e.target.value })}
          error={!!errors[`rel_${index}_nav`]}
          aria-invalid={!!errors[`rel_${index}_nav`]}
          aria-describedby={errors[`rel_${index}_nav`] ? `rel_${index}_nav-error` : undefined}
        />
        {errors[`rel_${index}_nav`] && <p id={`rel_${index}_nav-error`} className="text-sm text-red-600 mt-1">{errors[`rel_${index}_nav`]}</p>}
      </div>
      <div className="col-span-2">
        <Input
          placeholder="Foreign Key (optional)"
          value={relationship.foreignKey}
          onChange={e => update({ foreignKey: e.target.value })}
          error={!!errors[`rel_${index}_fk`]}
          aria-invalid={!!errors[`rel_${index}_fk`]}
          aria-describedby={errors[`rel_${index}_fk`] ? `rel_${index}_fk-error` : undefined}
        />
        {errors[`rel_${index}_fk`] && <p id={`rel_${index}_fk-error`} className="text-sm text-red-600 mt-1">{errors[`rel_${index}_fk`]}</p>}
      </div>
      <div className="col-span-2 text-gray-500 italic text-sm" title="Automatically suggested inverse navigation">
        Auto: <code>{relationship.inverseNavigation || 'N/A'}</code>
      </div>
      <div className="col-span-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          startIcon={<TrashBinIcon />}
          aria-label="Remove relationship"
        > </Button>
      </div>
    </div>
  );
}