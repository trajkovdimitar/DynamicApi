namespace TheBackend.Domain.Models
{
    public class WorkflowDefinitionRecord
    {
        public int Id { get; set; }
        public string WorkflowName { get; set; } = string.Empty;
        public string Definition { get; set; } = string.Empty;
    }
}
