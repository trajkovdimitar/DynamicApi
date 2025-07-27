namespace TheBackend.Domain.Models
{
    public class ModelDefinition
    {
        public string ModelName { get; set; } = string.Empty;
        public List<PropertyDefinition> Properties { get; set; } = new();
        public List<RelationshipDefinition> Relationships { get; set; } = new();
        public bool IgnoreMissingRelationships { get; set; }
    }

    public class PropertyDefinition
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsKey { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
    }
}
