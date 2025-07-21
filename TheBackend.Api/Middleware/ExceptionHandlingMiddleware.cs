using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace TheBackend.Api.Middleware;

public class ExceptionHandlingMiddleware : IMiddleware
{
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger)
    {
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            var response = ApiResponse<object>.Fail("An unexpected error occurred.");
            response.Meta.TraceId = context.TraceIdentifier;
            response.Meta.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}

