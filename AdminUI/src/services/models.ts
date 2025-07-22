// services/models.ts
import api from './api';
// You might need to adjust ApiResponse if its definition is forcing the `data` wrapper
// or use a more flexible type for this specific call if your API structure varies.
import type { ApiResponse, ModelDefinition } from '../types/models';

export async function getModels(): Promise<ModelDefinition[]> {
    console.log("getModels: Initiating API call to /models");
    try {
        // Here, we're explicitly telling Axios to expect an array of ModelDefinition directly
        // if your API doesn't wrap it in a `data` property.
        // If your ApiResponse type is defined as `interface ApiResponse<T> { data: T; }`
        // AND your backend returns `{"data": [...]}` then the original was correct.
        // BUT, given your console log, it seems your backend returns `[...]` directly.
        const res = await api.get<ModelDefinition[]>('/models'); // <--- Key change here: expect ModelDefinition[] directly

        console.log("getModels: Raw API response received (res.data):", res.data); // Log the actual data property

        // Check if res.data is an array
        if (Array.isArray(res.data)) {
            console.log("getModels: Data successfully extracted and is an array:", res.data);
            return res.data; // <--- Key change here: return res.data directly
        } else {
            console.warn("getModels: API response for /models was not a direct array.", res.data);
            return []; // Return an empty array if data is not an array
        }
    } catch (error) {
        console.error("getModels: Error fetching models:", error);
        return [];
    }
}

export async function saveModel(model: ModelDefinition): Promise<void> {
    try {
        await api.post('/models', model);
        console.log("Model saved successfully:", model.modelName);
    } catch (error) {
        console.error("Error saving model:", error);
        throw error;
    }
}