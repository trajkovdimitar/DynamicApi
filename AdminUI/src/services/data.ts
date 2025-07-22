import api from './api';
import type { ApiResponse } from '../types/models';

export async function getRecords(model: string) {
    const res = await api.get<ApiResponse<Record<string, unknown>[]>>('/' + model);
    return res.data.data;
}

export async function getRecord(model: string, id: string) {
    const res = await api.get<ApiResponse<Record<string, unknown>>>(`/${model}/${id}`);
    return res.data.data;
}

export async function saveRecord(model: string, record: Record<string, unknown>) {
    await api.post(`/${model}`, record);
}

export async function updateRecord(
    model: string,
    id: string,
    record: Record<string, unknown>
) {
    await api.put(`/${model}/${id}`, record);
}

export async function deleteRecord(model: string, id: string) {
    await api.delete(`/${model}/${id}`);
}
