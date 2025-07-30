import type { Parameter } from '../../types/models';

export const defaultParams: Record<string, Parameter[]> = {
  CreateEntity: [
    { key: 'ModelName', valueType: 'string', value: '' },
    { key: 'Mappings', valueType: 'json', value: '[]' },
  ],
  UpdateEntity: [
    { key: 'ModelName', valueType: 'string', value: '' },
    { key: 'Id', valueType: 'string', value: '' },
    { key: 'Mappings', valueType: 'json', value: '[]' },
  ],
  QueryEntity: [
    { key: 'ModelName', valueType: 'string', value: '' },
    { key: 'Filter', valueType: 'string', value: '' },
  ],
  SendEmail: [
    { key: 'To', valueType: 'string', value: '' },
    { key: 'Subject', valueType: 'string', value: '' },
    { key: 'Body', valueType: 'string', value: '' },
  ],
};
