using DynamicData;
using DynamicModelApi;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();

// Initial regeneration on startup
var app = builder.Build();
var dbService = app.Services.GetRequiredService<DynamicDbContextService>();
await dbService.RegenerateAndMigrateAsync();

app.MapControllers();
app.Run();