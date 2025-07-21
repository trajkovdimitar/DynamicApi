using TheBackend.DynamicModels;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TheBackend.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();
builder.Services.AddSingleton<BusinessRuleService>();

var app = builder.Build();
var dbService = app.Services.GetRequiredService<DynamicDbContextService>();
await dbService.RegenerateAndMigrateAsync();

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Unhandled exception");

        var response = ApiResponse<object>.Fail("An unexpected error occurred.");
        response.Meta.TraceId = context.TraceIdentifier;
        response.Meta.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(response);
    }
});

app.MapControllers();
app.Run();
