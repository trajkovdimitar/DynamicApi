import api from './api';

export interface SearchResults {
    models: { modelName: string }[];
    rules: { workflowName: string }[];
    workflows: { workflowName: string }[];
}

export async function searchEntities(q: string): Promise<SearchResults> {
    const res = await api.get<SearchResults>('/search', { params: { q } });
    return res.data;
}
