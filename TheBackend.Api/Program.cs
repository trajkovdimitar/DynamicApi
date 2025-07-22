using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using TheBackend.Api.Middleware;
using TheBackend.Application.Events;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();
builder.Services.AddSingleton<BusinessRuleService>();
builder.Services.AddSingleton<EventBus>();
builder.Services.AddSingleton<WorkflowEventHandler>();
builder.Services.AddTransient<ExceptionHandlingMiddleware>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5281")
                      .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


var app = builder.Build();
var dbService = app.Services.GetRequiredService<DynamicDbContextService>();
app.Lifetime.ApplicationStopped.Register(() => dbService.Dispose());
await dbService.RegenerateAndMigrateAsync();
var eventBus = app.Services.GetRequiredService<EventBus>();
var workflowHandler = app.Services.GetRequiredService<WorkflowEventHandler>();
eventBus.RegisterHandler<ModelCreatedEvent>(workflowHandler.HandleAsync);
eventBus.RegisterHandler<ModelUpdatedEvent>(workflowHandler.HandleAsync);
eventBus.RegisterHandler<ModelDeletedEvent>(workflowHandler.HandleAsync);
app.UseCors();
app.UseMiddleware<ExceptionHandlingMiddleware>();


app.MapControllers();
app.Run();
