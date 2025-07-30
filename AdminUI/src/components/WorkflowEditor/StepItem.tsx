import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WorkflowStep } from '../../types/models';

interface Props {
    id: string;
    step: WorkflowStep;
    selected: boolean;
    onClick: () => void;
}

export default function StepItem({ id, step, selected, onClick }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
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
            onClick={onClick}
            className={`border rounded p-2 cursor-pointer bg-white dark:bg-neutral-800 ${selected ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500' : ''} ${isDragging ? 'opacity-50' : ''}`}
        >
            Step {parseInt(id) + 1}: {step.type}
        </div>
    );
}
