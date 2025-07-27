using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System;

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
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "Database update error");
            var message = dbEx.InnerException?.Message?.Contains("FOREIGN KEY", StringComparison.OrdinalIgnoreCase) == true
                ? "Foreign key constraint violation."
                : "Database update failed.";
            var response = ApiResponse<object>.Fail(message);
            response.Meta.TraceId = context.TraceIdentifier;
            response.Meta.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(response);
        }
        catch (KeyNotFoundException nfEx)
        {
            _logger.LogWarning(nfEx, "Entity not found");
            var response = ApiResponse<object>.Fail(nfEx.Message);
            response.Meta.TraceId = context.TraceIdentifier;
            response.Meta.StatusCode = StatusCodes.Status404NotFound;
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(response);
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

