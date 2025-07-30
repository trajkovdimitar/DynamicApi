import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import type { WorkflowDefinition } from '../../types/models';

interface Props {
    workflow: WorkflowDefinition;
    onSelectStep: (index: number) => void;
}

export default function WorkflowFlowchart({ workflow, onSelectStep }: Props) {
    const nodes = workflow.steps.map((step, idx) => ({
        id: String(idx),
        data: { label: `${idx + 1}. ${step.type}` },
        position: { x: idx * 150, y: 0 },
    }));

    const edges = workflow.steps.slice(1).map((_, idx) => ({
        id: `e${idx}-${idx + 1}`,
        source: String(idx),
        target: String(idx + 1),
    }));

    return (
        <div className="h-64 border rounded">
            <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(_, node) => onSelectStep(Number(node.id))}>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}
