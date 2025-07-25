import { useEffect, useState, useRef } from 'react';
import { getWorkflows, getWorkflow, saveWorkflow } from '../services/workflows';
import type { WorkflowDefinition } from '../types/models';

export default function WorkflowsPage() {
    const [items, setItems] = useState<WorkflowDefinition[]>([]);
    const [editing, setEditing] = useState<string | null>(null);
    const designerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getWorkflows().then(setItems);
    }, []);

    useEffect(() => {
        if (!editing || !designerRef.current) return;
        (async () => {
            const wf = await getWorkflow(editing);
            const el = designerRef.current as any;
            el.workflow = wf;
        })();
    }, [editing]);

    const save = async () => {
        if (!designerRef.current) return;
        const el = designerRef.current as any;
        await saveWorkflow(el.workflow as WorkflowDefinition);
        setEditing(null);
        const data = await getWorkflows();
        setItems(data);
    };

    return (
        <div className="p-4 space-y-2">
            <h2 className="text-xl font-semibold">Workflows</h2>
            <ul>
                {items.map(w => (
                    <li key={w.workflowName} className="flex justify-between">
                        <span>{w.workflowName}</span>
                        <button onClick={() => setEditing(w.workflowName)} className="text-blue-600">Edit</button>
                    </li>
                ))}
            </ul>
            {editing && (
                <div className="space-y-2">
                    <div ref={designerRef} className="border h-[600px]" data-theme="light"></div>
                    <div className="space-x-2">
                        <button onClick={() => setEditing(null)} className="px-4 py-1 bg-gray-300">Cancel</button>
                        <button onClick={save} className="px-4 py-1 bg-blue-600 text-white">Save</button>
                    </div>
                </div>
            )}
        </div>
    );
}
