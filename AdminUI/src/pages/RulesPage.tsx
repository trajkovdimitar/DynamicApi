import { useEffect, useState } from 'react';
import { getWorkflows, saveWorkflow } from '../services/rules';
import type { Workflow } from '../types/models';

export default function RulesPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [editing, setEditing] = useState<Workflow | null>(null);
    const [text, setText] = useState('');

    useEffect(() => {
        getWorkflows().then(setWorkflows).catch(console.error);
    }, []);

    const startEdit = (wf?: Workflow) => {
        const w = wf ?? { workflowName: '', rules: [] };
        setEditing(w);
        setText(JSON.stringify(w, null, 2));
    };

    const save = async () => {
        if (!editing) return;
        await saveWorkflow(JSON.parse(text));
        setEditing(null);
        setWorkflows(await getWorkflows());
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Rules</h2>
                <button onClick={() => startEdit()} className="px-3 py-1 rounded bg-blue-600 text-white">
                    New
                </button>
            </div>
            <ul className="space-y-1">
                {workflows.map(w => (
                    <li key={w.workflowName} className="flex justify-between">
                        <span>{w.workflowName}</span>
                        <button className="text-blue-600" onClick={() => startEdit(w)}>
                            Edit
                        </button>
                    </li>
                ))}
            </ul>
            {editing && (
                <div className="space-y-2">
                    <textarea
                        className="w-full h-40 border dark:bg-neutral-800 p-2"
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                    <button onClick={save} className="px-3 py-1 rounded bg-blue-600 text-white">
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}
