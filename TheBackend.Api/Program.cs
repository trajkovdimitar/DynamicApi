using TheBackend.DynamicModels;
using TheBackend.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();

var app = builder.Build();
var dbService = app.Services.GetRequiredService<DynamicDbContextService>();
await dbService.RegenerateAndMigrateAsync();

app.MapControllers();
app.Run();
