import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { WorkflowStep } from '../../types/models';
import StepItem from './StepItem';
import { Button } from '../common/Button';

interface Props {
    steps: WorkflowStep[];
    selectedIndex: number | null;
    onSelect: (index: number | null) => void;
    onChange: (steps: WorkflowStep[]) => void;
}

export default function StepList({ steps, onSelect, selectedIndex, onChange }: Props) {
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = active.id as number;
            const newIndex = over.id as number;
            onChange(arrayMove(steps, oldIndex, newIndex));
            onSelect(newIndex);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={steps.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    <h3 className="font-bold text-lg mb-2">Steps</h3>
                    {steps.map((step, idx) => (
                        <StepItem
                            key={idx}
                            id={idx}
                            step={step}
                            selected={idx === selectedIndex}
                            onSelect={onSelect}
                        />
                    ))}
                    <Button variant="secondary" onClick={() => onSelect(steps.length)}>Add Step</Button>
                </div>
            </SortableContext>
        </DndContext>
    );
}
