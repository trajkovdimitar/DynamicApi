namespace TheBackend.Api;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = "Request successful";
    public T? Data { get; set; }
    public List<ValidationError>? Errors { get; set; }
    public MetaInfo Meta { get; set; } = new();

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message ?? "Request successful",
            Data = data
        };
    }

    public static ApiResponse<T> Fail(string message, List<ValidationError>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors
        };
    }
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
