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
    parameters?: Parameter[];
    condition?: string;
    onError?: string;
    outputVariable?: string;
}

export interface WorkflowDefinition {
    workflowName: string;
    steps: WorkflowStep[];
    version?: number;
    isTransactional: boolean;
    globalVariables: Parameter[];
}

export interface WorkflowNodeData {
    step: WorkflowStep;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}

export const stepTypes = [
    'CreateEntity',
    'UpdateEntity',
    'QueryEntity',
    'SendEmail',
] as const;

export const workflowEvents = [
    'AfterCreate',
    'AfterUpdate',
    'AfterDelete',
] as const;

export const valueTypes = [
    'string',
    'int',
    'bool',
    'double',
    'json',
] as const;

export interface Parameter {
    key: string;
    valueType: (typeof valueTypes)[number];
    value: string;
}


export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
