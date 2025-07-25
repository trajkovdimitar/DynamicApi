namespace TheBackend.Domain.Models
{
    public class WorkflowHistory
    {
        public int Id { get; set; }
        public string WorkflowName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Definition { get; set; } = string.Empty;
        public string Hash { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public int Version { get; set; }
    }
}
