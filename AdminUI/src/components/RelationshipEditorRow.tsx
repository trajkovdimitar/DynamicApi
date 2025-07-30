// --- RelationshipEditorRow.tsx ---
import Input from '../components/common/Input';
import Select from '../components/form/Select';
import { Button } from '../components/common/Button';
import { TrashBinIcon } from '../components/ui/icons';
import type { RelationshipDefinition } from '../types/models';

interface Props {
  index: number;
  currentModelName: string;
  relationship: RelationshipDefinition;
  availableModels: string[];
  errors: Record<string, string>;
  onUpdate: (index: number, changes: Partial<RelationshipDefinition>) => void;
  onRemove: (index: number) => void;
}

const RELATIONSHIP_TYPES = ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'];

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
    const fkSuggestion = `${val}Id`;
    const inverseNav = `${currentModelName}${relationship.relationshipType?.includes('many') ? 's' : ''}`;
    update({ targetModel: val, navigationName: navName, foreignKey: fkSuggestion, inverseNavigation: inverseNav });
  };

  const handleTypeChange = (val: string) => {
    const navName = `${relationship.targetModel}${val.includes('many') ? 's' : ''}`;
    const inverseNav = `${currentModelName}${val.includes('many') ? 's' : ''}`;
    update({ relationshipType: val, navigationName: navName, inverseNavigation: inverseNav });
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-b-0">
      <div className="col-span-2">
        <Select
          defaultValue={relationship.relationshipType}
          onChange={handleTypeChange}
          options={RELATIONSHIP_TYPES.map(t => ({
            value: t,
            label: t.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
          }))}
          placeholder="Type"
        />
        {errors[`rel_${index}_type`] && <p className="text-sm text-red-600">{errors[`rel_${index}_type`]}</p>}
      </div>
      <div className="col-span-2">
        <Select
          defaultValue={relationship.targetModel}
          onChange={handleTargetChange}
          options={availableModels.map(m => ({
            value: m,
            label: m,
            disabled: m === currentModelName
          }))}
          placeholder="Target"
        />
        {errors[`rel_${index}_target`] && <p className="text-sm text-red-600">{errors[`rel_${index}_target`]}</p>}
      </div>
      <div className="col-span-2">
        <Input
          placeholder="Navigation Name"
          value={relationship.navigationName}
          onChange={e => update({ navigationName: e.target.value })}
          error={!!errors[`rel_${index}_nav`]}
        />
        {errors[`rel_${index}_nav`] && <p className="text-sm text-red-600">{errors[`rel_${index}_nav`]}</p>}
      </div>
      <div className="col-span-2">
        <Input
          placeholder="Foreign Key"
          value={relationship.foreignKey}
          onChange={e => update({ foreignKey: e.target.value })}
        />
      </div>
      <div className="col-span-2 text-gray-500 italic text-sm">
        Auto: <code>{relationship.inverseNavigation}</code>
      </div>
      <div className="col-span-2">
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
