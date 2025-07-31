import { describe, it, expect } from 'vitest';
import { getDefaultParams, getRequiredProperties } from './utils';
import type { ModelDefinition } from '../../types/models';

describe('workflow utils', () => {
    const model: ModelDefinition = {
        modelName: 'Invoice',
        properties: [
            { name: 'InvoiceId', type: 'int', isKey: true, isRequired: true },
            { name: 'OrderId', type: 'int', isKey: false, isRequired: true },
            { name: 'Total', type: 'decimal', isKey: false, isRequired: true },
        ],
        relationships: [],
    };

    it('detects required properties', () => {
        expect(getRequiredProperties(model)).toEqual(['OrderId', 'Total']);
    });

    it('generates default mappings for required fields', () => {
        const params = getDefaultParams('CreateEntity', model);
        const mappings = JSON.parse(params.find(p => p.key === 'Mappings')!.value);
        expect(mappings.length).toBe(2);
        expect(mappings[0].To).toBe('OrderId');
        expect(mappings[1].To).toBe('Total');
    });
});
