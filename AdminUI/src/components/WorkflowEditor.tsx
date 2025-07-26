import { useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { Modal } from './Modal';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serializeWorkflow, stepSchema } from '../utils/workflowUtils';
import type { WorkflowDefinition, WorkflowStep, Parameter } from '../types/models';

interface Props {
    initialWorkflow: WorkflowDefinition;
    onSave: (def: WorkflowDefinition) => void;
}

export function WorkflowEditor({ initialWorkflow, onSave }: Props) {
    const initialNodes = initialWorkflow.steps.map((s, idx) => ({ id: `${idx}`, position: { x: idx * 150, y: 50 }, data: { step: s }, type: 'default' }));
    const initialEdges = initialWorkflow.steps.slice(1).map((_, idx) => ({ id: `e${idx}`, source: `${idx}`, target: `${idx + 1}` }));
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((params: any) => setEdges(eds => addEdge(params, eds)), [setEdges]);

    const handleSave = () => {
        const def = serializeWorkflow(nodes, edges, initialWorkflow);
        onSave(def);
    };

    return (
        <div className="h-[600px] border">
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}>
                <Controls />
                <MiniMap />
                <Background />
            </ReactFlow>
            <div className="mt-2 space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}
