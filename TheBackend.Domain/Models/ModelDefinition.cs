namespace TheBackend.Domain.Models
{
    public class ModelDefinition
    {
        public string ModelName { get; set; } = string.Empty;
        public List<PropertyDefinition> Properties { get; set; } = new();
        public List<RelationshipDefinition> Relationships { get; set; } = new();
        public bool IgnoreMissingRelationships { get; set; }
    }
}
