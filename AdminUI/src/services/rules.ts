import api from './api';
import type { ApiResponse, Workflow } from '../types/models';

export async function getWorkflows(): Promise<Workflow[]> { // Explicitly promise an array
    try {
        const res = await api.get<ApiResponse<Workflow[]>>('/rules');
        // Ensure res.data and res.data.data exist and is an array
        if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
        } else {
            console.warn("API response for /rules did not contain an array in res.data.data:", res.data);
            return []; // Return an empty array if data is not as expected
        }
    } catch (error) {
        // Log the error for debugging
        console.error("Error fetching workflows:", error);
        // Crucially, return an empty array on any error to prevent 'undefined' issues in components
        return [];
    }
}

export async function getWorkflow(name: string): Promise<Workflow | undefined> { // Can return undefined on error
    try {
        const res = await api.get<ApiResponse<Workflow>>(`/rules/${name}`);
        if (res.data && res.data.data) {
            return res.data.data;
        } else {
            console.warn(`API response for /rules/${name} did not contain data:`, res.data);
            return undefined; // Return undefined if data is not found/expected
        }
    } catch (error) {
        console.error(`Error fetching workflow '${name}':`, error);
        return undefined; // Return undefined on error
    }
}

export async function saveWorkflow(workflow: Workflow): Promise<void> { // Return void, or Workflow if API returns it
    try {
        // Assuming api.post handles successful responses with no body or status 204
        await api.post('/rules', workflow);
        // You might want to return something from the API if it returns the saved object, e.g., return res.data.data;
    } catch (error) {
        console.error("Error saving workflow:", error);
        // Re-throw the error so the calling component can handle it (e.g., show an error message)
        throw error;
    }
}