import api from './api';
import type { ApiResponse } from '../types/models';
import type { WorkflowDefinition } from '../types/models';

export async function getWorkflows(): Promise<WorkflowDefinition[]> {
    const res = await api.get<ApiResponse<WorkflowDefinition[]>>('/workflows');
    return res.data.data;
}

export async function getWorkflow(name: string): Promise<WorkflowDefinition> {
    const res = await api.get<ApiResponse<WorkflowDefinition>>(`/workflows/${name}`);
    return res.data.data;
}

export async function saveWorkflow(def: WorkflowDefinition): Promise<void> {
    await api.post('/workflows', def);
}
