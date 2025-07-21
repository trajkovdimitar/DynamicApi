namespace TheBackend.Admin.Shared;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = "Request successful";
    public T? Data { get; set; }
    public List<ValidationError>? Errors { get; set; }
    public MetaInfo Meta { get; set; } = new();
}

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Error { get; set; } = string.Empty;
}

public class MetaInfo
{
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? CorrelationId { get; set; }
    public string? TraceId { get; set; }
    public int? StatusCode { get; set; }
    public string ApiVersion { get; set; } = "v1";
}
