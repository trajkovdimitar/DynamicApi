import { z } from 'zod';
import type { WorkflowDefinition, WorkflowStep, Parameter, ElsaActivity, ElsaWorkflowDefinition } from '../types/models';

export const parameterSchema = z.object({
    key: z.string().min(1),
    valueType: z.enum(['string', 'int', 'bool', 'double', 'json']),
    value: z.string(),
});

export const stepSchema = z.object({
    type: z.enum(['CreateEntity', 'UpdateEntity', 'QueryEntity', 'SendEmail', 'ElsaWorkflow']),
    parameters: z.array(parameterSchema),
    condition: z.string().optional(),
    onError: z.string().optional(),
    outputVariable: z.string().optional(),
});

export const workflowSchema = z.object({
    workflowName: z.string().min(1),
    steps: z.array(stepSchema),
    version: z.number().optional(),
    isTransactional: z.boolean(),
    globalVariables: z.array(parameterSchema),
});

export const elsaActivitySchema = z.object({
    type: z.string(),
    properties: z.record(z.any()),
});

export const elsaWorkflowSchema = workflowSchema.extend({
    activities: z.array(elsaActivitySchema),
    connections: z.array(z.any()),
    triggers: z.array(elsaActivitySchema).optional(),
});

export function serializeWorkflow(nodes: any[], edges: any[], base: Partial<WorkflowDefinition>): WorkflowDefinition {
    const steps = nodes.map(n => n.data.step as WorkflowStep);
    return workflowSchema.parse({ ...base, steps });
}

export function serializeForElsa(nodes: any[], edges: any[]): ElsaWorkflowDefinition {
    return {
        workflowName: '',
        steps: [],
        isTransactional: false,
        globalVariables: [],
        activities: nodes.map(n => ({ type: n.data.type, properties: n.data.parameters })),
        connections: edges.map(e => ({ source: e.source, target: e.target })),
    } as unknown as ElsaWorkflowDefinition;
}

export function loadFromElsa(def: ElsaWorkflowDefinition): { nodes: any[]; edges: any[] } {
    return { nodes: [], edges: [] };
}
