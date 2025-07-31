import type { ModelDefinition, Parameter } from '../../types/models';

export function getRequiredProperties(model?: ModelDefinition): string[] {
    if (!model) return [];
    return model.properties
        .filter(p => p.isRequired && !p.isKey)
        .map(p => p.name);
}

export function getDefaultParams(type: string, model?: ModelDefinition): Parameter[] {
    const base: Record<string, Parameter[]> = {
        CreateEntity: [
            { key: 'ModelName', valueType: 'string', value: model?.modelName ?? '' },
            { key: 'Mappings', valueType: 'json', value: '[]' },
        ],
        UpdateEntity: [
            { key: 'ModelName', valueType: 'string', value: model?.modelName ?? '' },
            { key: 'Id', valueType: 'string', value: '' },
            { key: 'Mappings', valueType: 'json', value: '[]' },
        ],
        QueryEntity: [
            { key: 'ModelName', valueType: 'string', value: model?.modelName ?? '' },
            { key: 'Filter', valueType: 'string', value: '' },
        ],
        SendEmail: [
            { key: 'To', valueType: 'string', value: '' },
            { key: 'Subject', valueType: 'string', value: '' },
            { key: 'Body', valueType: 'string', value: '' },
        ],
    };

    const defaults = base[type] ? JSON.parse(JSON.stringify(base[type])) as Parameter[] : [];
    if (type === 'CreateEntity' && defaults.length > 0) {
        const mappingsParam = defaults.find(p => p.key === 'Mappings');
        if (mappingsParam) {
            const required = getRequiredProperties(model);
            const mappings = required.map(r => ({ To: r, From: `{{ Input.${r} }}` }));
            mappingsParam.value = JSON.stringify(mappings);
        }
    }
    return defaults;
}
