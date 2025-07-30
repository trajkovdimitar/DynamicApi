import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import type { WorkflowStep } from '../../types/models';

interface Props {
    step: WorkflowStep;
    id: number;
    selected: boolean;
    onSelect: (index: number) => void;
}

export default function StepItem({ step, id, selected, onSelect }: Props) {
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
            onClick={() => onSelect(id)}
        >
            Step {id + 1}: {step.type}
        </div>
    );
}
