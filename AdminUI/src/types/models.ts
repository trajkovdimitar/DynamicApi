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
    relationships: RelationshipDefinition[];
}

export interface RelationshipDefinition {
    relationshipType: string;
    targetModel: string;
    navigationName: string;
    foreignKey: string;
    inverseNavigation: string;
}

// Ensure these are exported
export interface Rule {
    ruleName: string;
    expression?: string;
    errorMessage?: string;
}

export interface Workflow {
    workflowName: string;
    rules: Rule[];
}

export interface WorkflowStep {
    type: string;
    parameters?: Record<string, unknown>;
}

export interface WorkflowDefinition {
    workflowName: string;
    steps: WorkflowStep[];
    version?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
