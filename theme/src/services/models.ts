import api from './api';
import type { ApiResponse, ModelDefinition } from '../types/models';

export async function getModels(): Promise<ModelDefinition[]> {
    const res = await api.get<ApiResponse<ModelDefinition[]>>('/models');
    return res.data.data;
}
