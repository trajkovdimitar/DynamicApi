import { useState } from 'react';
import StepList from './StepList';
import StepPropertiesPanel from './StepPropertiesPanel';
import GlobalVariablesEditor from './GlobalVariablesEditor';
import FlowPreview from './FlowPreview';
import type { WorkflowDefinition } from '../../types/models';

interface Props {
  workflow: WorkflowDefinition;
  onChange: (wf: WorkflowDefinition) => void;
}

export default function WorkflowEditor({ workflow, onChange }: Props) {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <div className="col-span-3 border-r pr-4 overflow-y-auto">
        <GlobalVariablesEditor workflow={workflow} onChange={onChange} />
        <StepList
          workflow={workflow}
          onChange={onChange}
          selectedIndex={selectedStepIndex}
          onSelect={setSelectedStepIndex}
        />
      </div>
      <div className="col-span-6 pl-4 space-y-4">
        {selectedStepIndex !== null && (
          <StepPropertiesPanel
            workflow={workflow}
            step={workflow.steps[selectedStepIndex]}
            index={selectedStepIndex}
            onChange={(updated) => {
              const steps = [...workflow.steps];
              steps[selectedStepIndex] = updated;
              onChange({ ...workflow, steps });
            }}
          />
        )}
      </div>
      <div className="col-span-3 pl-4">
        <FlowPreview workflow={workflow} onSelectStep={(i) => setSelectedStepIndex(i)} />
      </div>
    </div>
  );
}
