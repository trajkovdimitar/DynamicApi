using Microsoft.AspNetCore.OData;
using Microsoft.OData.ModelBuilder;
using TheBackend.DynamicModels;
using TheBackend.DynamicModels.Workflows;
using TheBackend.Domain.Models;
using TheBackend.Api.Middleware;
using TheBackend.Application.Services;
using TheBackend.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();
builder.Services.AddSingleton<ModelHistoryService>();
builder.Services.AddSingleton<RuleHistoryService>();
builder.Services.AddSingleton<WorkflowHistoryService>();
var rulesPath = Path.Combine(AppContext.BaseDirectory, "rules.json");
builder.Services.AddSingleton(_ => new BusinessRuleService(rulesPath));
builder.Services.AddSingleton<WorkflowService>();
builder.Services.AddTransient<IWorkflowStepExecutor>(sp => new CreateEntityExecutor<object, object>());
builder.Services.AddTransient(typeof(CreateEntityExecutor<,>), typeof(CreateEntityExecutor<,>));

builder.Services.AddTransient<IWorkflowStepExecutor>(sp => new UpdateEntityExecutor<object, object>(sp.GetRequiredService<ILogger<UpdateEntityExecutor<object, object>>>()));
builder.Services.AddTransient(typeof(UpdateEntityExecutor<,>), typeof(UpdateEntityExecutor<,>));

builder.Services.AddTransient<IWorkflowStepExecutor>(sp => new QueryEntityExecutor<object, object>());
builder.Services.AddTransient(typeof(QueryEntityExecutor<,>), typeof(QueryEntityExecutor<,>));

builder.Services.AddTransient<IWorkflowStepExecutor<object, bool>>(sp => new SendEmailExecutor<object>(sp.GetRequiredService<IEmailService>()));
builder.Services.AddTransient(typeof(SendEmailExecutor<>), typeof(SendEmailExecutor<>));

builder.Services.AddTransient(typeof(IWorkflowStepExecutor<,>), typeof(QueryEntityExecutor<,>));
builder.Services.AddTransient<IEmailService, LoggingEmailService>();
builder.Services.AddSingleton<WorkflowStepExecutorRegistry>();
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

using var tempProvider = builder.Services.BuildServiceProvider();
var tempDbService = tempProvider.GetRequiredService<DynamicDbContextService>();
await tempDbService.RegenerateAndMigrateAsync();
var odataBuilder = new ODataConventionModelBuilder();
foreach (var type in tempDbService.GetAllModelTypes())
{
    var et = odataBuilder.AddEntityType(type);
    odataBuilder.AddEntitySet($"{type.Name}s", et);
}
var model = odataBuilder.GetEdmModel();
tempDbService.Dispose();

builder.Services.AddControllers()
    .AddOData(options =>
        options.Select().Filter().OrderBy().Expand().Count().SetMaxTop(null)
               .AddRouteComponents("odata", model));

var app = builder.Build();
var dbService = app.Services.GetRequiredService<DynamicDbContextService>();
app.Lifetime.ApplicationStopped.Register(() => dbService.Dispose());
await dbService.RegenerateAndMigrateAsync();

app.UseCors();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapControllers();
app.Run();
