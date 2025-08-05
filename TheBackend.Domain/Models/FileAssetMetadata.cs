namespace TheBackend.Domain.Models
{
    public class FileAssetMetadata
    {
        public Guid Id { get; set; }  // New: Include Id for access
        public string FileName { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long Size { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}