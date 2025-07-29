export interface PropertyDefinition {
    name: string;
    type: string;
    isKey?: boolean;
    isRequired?: boolean;
    maxLength?: number | null;
}

export interface RelationshipDefinition {
    relationshipType: string;
    targetModel: string;
    navigationName: string;
    foreignKey: string;
    inverseNavigation: string;
}

export interface ModelDefinition {
    modelName: string;
    properties: PropertyDefinition[];
    relationships: RelationshipDefinition[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
