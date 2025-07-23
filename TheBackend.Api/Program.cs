using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using TheBackend.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();
builder.Services.AddSingleton<ModelHistoryService>();
builder.Services.AddSingleton<BusinessRuleService>();
builder.Services.AddTransient<ExceptionHandlingMiddleware>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
                      .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


var app = builder.Build();
var dbService = app.Services.GetRequiredService<DynamicDbContextService>();
app.Lifetime.ApplicationStopped.Register(() => dbService.Dispose());
await dbService.RegenerateAndMigrateAsync();
var modelService = app.Services.GetRequiredService<ModelDefinitionService>();
var historyService = app.Services.GetRequiredService<ModelHistoryService>();
historyService.EnsureHistory(modelService.LoadModels(), modelService.ComputeModelsHash());
app.UseCors();
app.UseMiddleware<ExceptionHandlingMiddleware>();


app.MapControllers();
app.Run();
