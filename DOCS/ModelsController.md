# ModelsController API

`ModelsController` manages the dynamic model definitions stored in `models.json`.
It exposes endpoints to list all models and to create or update a model.
The controller regenerates the Entity Framework Core context whenever a model
changes and records each update in the model history log.

## Endpoints

### `GET /api/models`
Returns all model definitions wrapped in an `ApiResponse` object.

### `POST /api/models`
Accepts a `ModelDefinition` payload. The controller saves the definition,
rebuilds the EF Core context and applies migrations. On success the updated
model list hash is recorded in the history log.

If validation fails a `400 Bad Request` is returned with a descriptive message.
Unexpected errors yield a `500 Internal Server Error`.

## `ModelDefinition` fields
- `ModelName` *(string)* – name of the entity.
- `Properties` *(List<PropertyDefinition>)* – collection of property descriptors.
- `Relationships` *(List<RelationshipDefinition>)* – entity relationships.
- `IgnoreMissingRelationships` *(bool)* – when `true` relationship validation is
  skipped for this model. Defaults to `false`.

### `PropertyDefinition`
- `Name` *(string)* – property name.
- `Type` *(string)* – CLR type, e.g. `string` or `int`.
- `IsKey` *(bool)* – indicates the primary key.
- `IsRequired` *(bool)* – marks the property as non-nullable.
- `MaxLength` *(int?)* – optional maximum length.

### `RelationshipDefinition`
- `RelationshipType` *(string)* – type such as `OneToMany` or `ManyToOne`.
- `TargetModel` *(string)* – referenced model name.
- `NavigationName` *(string)* – navigation property name.
- `ForeignKey` *(string)* – foreign key property.
- `InverseNavigation` *(string)* – inverse navigation property.

## Example
```json
{
  "ModelName": "BlogPost",
  "IgnoreMissingRelationships": true,
  "Properties": [
    { "Name": "Id", "Type": "int", "IsKey": true },
    { "Name": "Title", "Type": "string", "IsRequired": true, "MaxLength": 200 }
  ],
  "Relationships": [
    { "RelationshipType": "ManyToOne", "TargetModel": "Author", "NavigationName": "Author" }
  ]
}
```
This example disables relationship validation so `Author` does not need to exist
when the model is created.
