import React, { useEffect, useRef, useState } from 'react';
import { ElsaWorkflowDesigner } from '@elsa-workflows/elsa-workflows-designer';
import type { WorkflowDefinition } from '../types/models';
import { elsaWorkflowSchema } from '../utils/workflowUtils';

interface Props {
    initialWorkflow: WorkflowDefinition;
    onSave: (def: WorkflowDefinition) => void;
}

export function WorkflowEditor({ initialWorkflow, onSave }: Props) {
    const designerRef = useRef<any>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (designerRef.current && !loaded) {
            designerRef.current.workflow = initialWorkflow;
            setLoaded(true);
        }
    }, [initialWorkflow, loaded]);

    const handleSave = () => {
        if (!designerRef.current) return;
        const def = designerRef.current.workflow as WorkflowDefinition;
        elsaWorkflowSchema.parse(def);
        onSave(def);
    };

    const addTrigger = () => {
        if (!designerRef.current) return;
        designerRef.current.addActivity({ type: 'HttpEndpoint', properties: { path: '/triggers/my-event', methods: ['POST'] } });
    };

    return (
        <div style={{ height: '600px' }}>
            <ElsaWorkflowDesigner ref={designerRef} serverUrl="/elsa/api" />
            <div className="mt-2 space-x-2">
                <button className="px-3 py-1 bg-green-600 text-white" onClick={addTrigger}>Add Event Trigger</button>
                <button className="px-3 py-1 bg-blue-600 text-white" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}

