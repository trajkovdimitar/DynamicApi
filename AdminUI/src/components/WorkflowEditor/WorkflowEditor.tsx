import StepList from './StepList';
import StepPropertiesPanel from './StepPropertiesPanel';
import GlobalVariablesEditor from './GlobalVariablesEditor';
import type { WorkflowDefinition } from '../../types/models';

interface Props {
    workflow: WorkflowDefinition;
    onChange: (workflow: WorkflowDefinition) => void;
    selectedStepIndex: number | null;
    setSelectedStepIndex: (index: number | null) => void;
}

export default function WorkflowEditor({
    workflow,
    onChange,
    selectedStepIndex,
    setSelectedStepIndex,
}: Props) {
    return (
        <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-3 border-r pr-4 overflow-y-auto">
                <GlobalVariablesEditor workflow={workflow} onChange={onChange} />
                <StepList
                    steps={workflow.steps}
                    selectedIndex={selectedStepIndex}
                    onSelect={setSelectedStepIndex}
                    onChange={(steps) => onChange({ ...workflow, steps })}
                />
            </div>
            <div className="col-span-9 pl-4">
                {selectedStepIndex !== null && selectedStepIndex < workflow.steps.length && (
                    <StepPropertiesPanel
                        step={workflow.steps[selectedStepIndex]}
                        index={selectedStepIndex}
                        onChange={(updatedStep) => {
                            const steps = [...workflow.steps];
                            steps[selectedStepIndex] = updatedStep;
                            onChange({ ...workflow, steps });
                        }}
                    />
                )}
            </div>
        </div>
    );
}
