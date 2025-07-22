export interface PropertyDefinition {
    name: string;
    type: string;
    required?: boolean;
}

export interface ModelDefinition {
    name: string;
    properties: PropertyDefinition[];
}

export interface Workflow {
    name: string;
    trigger: string;
    actions: any[];
}
