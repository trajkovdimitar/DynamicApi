export interface PropertyDefinition {
    name: string;
    type: string;
    isKey?: boolean;
    isRequired?: boolean;
    maxLength?: number | null;
}

export interface ModelDefinition {
    modelName: string;
    properties: PropertyDefinition[];
}

export interface Rule {
    ruleName: string;
    expression?: string;
    errorMessage?: string;
}

export interface Workflow {
    workflowName: string;
    rules: Rule[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
