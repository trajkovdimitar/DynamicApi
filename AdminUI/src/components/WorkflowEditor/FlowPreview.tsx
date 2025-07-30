import React from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import type { WorkflowDefinition } from '../../types/models';

interface Props {
  workflow: WorkflowDefinition;
  onSelectStep: (index: number) => void;
}

export default function FlowPreview({ workflow, onSelectStep }: Props) {
  const nodes: Node[] = workflow.steps.map((s, idx) => ({
    id: idx.toString(),
    data: { label: `${idx + 1}: ${s.type}` },
    position: { x: idx * 150, y: 0 },
  }));

  const edges: Edge[] = workflow.steps.slice(1).map((_, idx) => ({
    id: `e${idx}`,
    source: idx.toString(),
    target: (idx + 1).toString(),
  }));

  return (
    <div className="h-64 border rounded">
      <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(_, node) => onSelectStep(parseInt(node.id, 10))}>
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
