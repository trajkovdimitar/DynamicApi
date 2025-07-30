import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WorkflowStep } from '../../types/models';
import { Button } from '../common/Button';

interface Props {
    steps: WorkflowStep[];
    selectedIndex: number | null;
    onSelect: (index: number | null) => void;
    onReorder: (steps: WorkflowStep[]) => void;
    onAdd: () => void;
}

export default function StepList({ steps, selectedIndex, onSelect, onReorder, onAdd }: Props) {
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = Number(active.id);
            const newIndex = Number(over.id);
            onReorder(arrayMove(steps, oldIndex, newIndex));
        }
    };

    return (
        <div className="space-y-2">
            <h3 className="font-bold text-lg mb-2">Steps</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map((_, idx) => idx.toString())} strategy={verticalListSortingStrategy}>
                    {steps.map((step, idx) => (
                        <SortableStepItem
                            key={idx}
                            id={idx.toString()}
                            index={idx}
                            step={step}
                            selected={idx === selectedIndex}
                            onSelect={() => onSelect(idx)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            <Button variant="secondary" onClick={onAdd}>
                Add Step
            </Button>
        </div>
    );
}

interface ItemProps {
    id: string;
    index: number;
    step: WorkflowStep;
    selected: boolean;
    onSelect: () => void;
}

function SortableStepItem({ id, index, step, selected, onSelect }: ItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`border rounded p-2 cursor-pointer ${selected ? 'bg-brand-50 border-brand-500' : ''}`}
            onClick={onSelect}
        >
            Step {index + 1}: {step.type}
        </div>
    );
}
