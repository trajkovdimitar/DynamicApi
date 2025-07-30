import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { WorkflowStep } from '../../types/models';
import { stepTypes } from '../../types/models';
import StepItem from './StepItem';
import { Button } from '../common/Button';

interface Props {
    steps: WorkflowStep[];
    selectedIndex: number | null;
    onSelect: (index: number | null) => void;
    onChange: (steps: WorkflowStep[]) => void;
}

export default function StepList({ steps, selectedIndex, onSelect, onChange }: Props) {
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = parseInt(active.id as string, 10);
            const newIndex = parseInt(over.id as string, 10);
            const newSteps = arrayMove(steps, oldIndex, newIndex);
            onChange(newSteps);
            onSelect(newIndex);
        }
    };

    const addStep = () => {
        const newStep: WorkflowStep = {
            type: stepTypes[0],
            parameters: [],
            condition: '',
            onError: '',
            outputVariable: '',
        };
        const newSteps = [...steps, newStep];
        onChange(newSteps);
        onSelect(newSteps.length - 1);
    };

    return (
        <div className="space-y-2">
            <h3 className="font-bold text-lg mb-2">Steps</h3>
            <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map((_, idx) => idx.toString())} strategy={verticalListSortingStrategy}>
                    {steps.map((step, idx) => (
                        <StepItem
                            key={idx}
                            id={idx.toString()}
                            step={step}
                            selected={idx === selectedIndex}
                            onClick={() => onSelect(idx)}
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
