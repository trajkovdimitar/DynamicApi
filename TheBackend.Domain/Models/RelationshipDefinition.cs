namespace TheBackend.Domain.Models
{
    public class RelationshipDefinition
    {
        public string RelationshipType { get; set; } = string.Empty;
        public string TargetModel { get; set; } = string.Empty;
        public string NavigationName { get; set; } = string.Empty;
        public string ForeignKey { get; set; } = string.Empty;
        public string InverseNavigation { get; set; } = string.Empty;
    }
}
