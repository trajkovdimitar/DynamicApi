namespace TheBackend.Domain.Models
{
    public class ModelHistory
    {
        public int Id { get; set; }
        public string ModelName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Definition { get; set; } = string.Empty;
        public string Hash { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
