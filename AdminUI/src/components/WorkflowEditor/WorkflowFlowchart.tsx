import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import type { WorkflowDefinition } from '../../types/models';

interface Props {
    workflow: WorkflowDefinition;
    onSelect?: (index: number) => void;
}

export default function WorkflowFlowchart({ workflow, onSelect }: Props) {
    const nodes: Node[] = workflow.steps.map((s, idx) => ({
        id: idx.toString(),
        data: { label: `${idx + 1}. ${s.type}` },
        position: { x: idx * 200, y: 0 },
    }));
    const edges: Edge[] = workflow.steps.slice(1).map((_, idx) => ({
        id: `e${idx}-${idx + 1}`,
        source: idx.toString(),
        target: (idx + 1).toString(),
    }));

    return (
        <div style={{ height: 200 }} className="border rounded">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                onNodeClick={(_, node) => onSelect && onSelect(Number(node.id))}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}
