import api from './api';
import type { ApiResponse, Workflow } from '../types/models';

export async function getWorkflows() {
    const res = await api.get<ApiResponse<Workflow[]>>('/rules');
    return res.data.data;
}

export async function getWorkflow(name: string) {
    const res = await api.get<ApiResponse<Workflow>>(`/rules/${name}`);
    return res.data.data as Workflow;
}

export async function saveWorkflow(workflow: Workflow) {
    await api.post('/rules', workflow);
}
