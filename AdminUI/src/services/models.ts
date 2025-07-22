import api from './api';
import type { ApiResponse, ModelDefinition } from '../types/models';

export async function getModels() {
    const res = await api.get<ApiResponse<ModelDefinition[]>>('/models');
    return res.data.data;
}

export async function saveModel(model: ModelDefinition) {
    await api.post('/models', model);
}
