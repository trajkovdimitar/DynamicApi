using TheBackend.DynamicModels;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();
builder.Services.AddSingleton<BusinessRuleService>();

var app = builder.Build();
var dbService = app.Services.GetRequiredService<DynamicDbContextService>();
await dbService.RegenerateAndMigrateAsync();

app.MapControllers();
app.Run();
