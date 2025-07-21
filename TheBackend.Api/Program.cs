using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using TheBackend.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();
builder.Services.AddSingleton<BusinessRuleService>();
builder.Services.AddTransient<ExceptionHandlingMiddleware>();

var app = builder.Build();
var dbService = app.Services.GetRequiredService<DynamicDbContextService>();
app.Lifetime.ApplicationStopped.Register(() => dbService.Dispose());
await dbService.RegenerateAndMigrateAsync();
app.UseMiddleware<ExceptionHandlingMiddleware>();


app.MapControllers();
app.Run();
