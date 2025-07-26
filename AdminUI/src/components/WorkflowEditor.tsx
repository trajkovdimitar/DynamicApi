import React, { useEffect, useRef, useState } from 'react';
import { defineCustomElements } from '@elsa-workflows/elsa-workflows-studio/loader';
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
        defineCustomElements(window);
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

    const addTrigger = async () => {
        if (!designerRef.current) return;

        // Obtain the underlying flowchart element which exposes the addActivity API.
        const chart = await designerRef.current.getFlowchart();
        if (!chart) return;

        await chart.addActivity({
            type: 'HttpEndpoint',
            properties: { path: '/triggers/my-event', methods: ['POST'] }
        });
    };

    return (
        <div style={{ height: '600px' }}>
            <elsa-workflow-definition-editor ref={designerRef} server-url="/elsa/api"></elsa-workflow-definition-editor>
            <div className="mt-2 space-x-2">
                <button className="px-3 py-1 bg-green-600 text-white" onClick={addTrigger}>Add Event Trigger</button>
                <button className="px-3 py-1 bg-blue-600 text-white" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}

