import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WorkflowDefinition, WorkflowStep } from '../../types/models';
import { stepTypes } from '../../types/models';
import { Button } from '../common/Button';
import clsx from 'clsx';

interface Props {
  workflow: WorkflowDefinition;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  onChange: (wf: WorkflowDefinition) => void;
}

interface StepItemProps {
  id: number;
  step: WorkflowStep;
  selected: boolean;
  onSelect: (index: number) => void;
}

function SortableStepItem({ id, step, selected, onSelect }: StepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'border rounded p-2 bg-white dark:bg-neutral-800 cursor-pointer',
        selected && 'bg-brand-50 border-brand-500',
        isDragging && 'opacity-50'
      )}
      onClick={() => onSelect(id)}
      {...attributes}
      {...listeners}
    >
      Step {id + 1}: {step.type}
    </div>
  );
}

export default function StepList({ workflow, onChange, selectedIndex, onSelect }: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const steps = arrayMove(workflow.steps, active.id, over.id);
      onChange({ ...workflow, steps });
    }
  };

  const addStep = () => {
    onSelect(workflow.steps.length);
    onChange({
      ...workflow,
      steps: [
        ...workflow.steps,
        {
          type: stepTypes[0],
          parameters: [],
          condition: '',
          onError: '',
          outputVariable: '',
        },
      ],
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg mb-2">Steps</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={workflow.steps.map((_, i) => i)} strategy={verticalListSortingStrategy}>
          {workflow.steps.map((step, idx) => (
            <SortableStepItem
              key={idx}
              id={idx}
              step={step}
              selected={idx === selectedIndex}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button variant="secondary" onClick={addStep}>
        Add Step
      </Button>
    </div>
  );
}
