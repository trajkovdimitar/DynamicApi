import StepList from './StepList';
import StepPropertiesPanel from './StepPropertiesPanel';
import GlobalVariablesEditor from './GlobalVariablesEditor';
import WorkflowFlowchart from './WorkflowFlowchart';
import type { WorkflowDefinition, WorkflowStep } from '../../types/models';

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
    const updateSteps = (steps: WorkflowStep[]) => {
        onChange({ ...workflow, steps });
    };

    const addStep = () => {
        updateSteps([
            ...workflow.steps,
            { type: 'CreateEntity', parameters: [], condition: '', onError: '', outputVariable: '' },
        ]);
        setSelectedStepIndex(workflow.steps.length);
    };

    const completions = [
        ...workflow.globalVariables.map((g) => `Vars.${g.key}`),
        ...workflow.steps.map((s) => s.outputVariable ? `Workflow.${s.outputVariable}` : '').filter(Boolean),
        'Input.',
    ];

    return (
        <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-3 border-r pr-4 overflow-y-auto">
                <GlobalVariablesEditor workflow={workflow} onChange={onChange} />
                <StepList
                    steps={workflow.steps}
                    selectedIndex={selectedStepIndex}
                    onSelect={setSelectedStepIndex}
                    onReorder={updateSteps}
                    onAdd={addStep}
                />
            </div>
            <div className="col-span-9 pl-4 space-y-4">
                <WorkflowFlowchart workflow={workflow} onSelect={setSelectedStepIndex} />
                {selectedStepIndex !== null && workflow.steps[selectedStepIndex] && (
                    <StepPropertiesPanel
                        step={workflow.steps[selectedStepIndex]}
                        index={selectedStepIndex}
                        onChange={(step) => {
                            const steps = [...workflow.steps];
                            steps[selectedStepIndex] = step;
                            updateSteps(steps);
                        }}
                        availableCompletions={completions}
                    />
                )}
            </div>
        </div>
    );
}
