namespace TheBackend.Domain.Models
{
    public class PropertyDefinition
    {
        public string Name { get; set; } = string.Empty;
        public BuiltInType Type { get; set; }
        public bool IsKey { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
    }
}