import api from './api';
import type { ApiResponse, ModelDefinition } from '../types/models';

export async function getModels(): Promise<ModelDefinition[]> {
    try {
        const res = await api.get<ApiResponse<ModelDefinition[]>>('/models');
        return res.data.data;
    } catch (error) {
        console.error('getModels: Error fetching models:', error);
        return [];
    }
}

export async function saveModel(model: ModelDefinition): Promise<void> {
    try {
        await api.post('/models', model);
        console.log('Model saved successfully:', model.modelName);
    } catch (error) {
        console.error('Error saving model:', error);
        throw error;
    }
}
