using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using TheBackend.Api.Middleware;
using HotChocolate.Types;
using TheBackend.Api.GraphQL;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();
builder.Services.AddSingleton<BusinessRuleService>();
builder.Services.AddTransient<ExceptionHandlingMiddleware>();

builder.Services
    .AddGraphQLServer()
    .BindRuntimeType<object, AnyType>()
    .AddQueryType<DynamicQuery>()
    .AddMutationType<DynamicMutation>();
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
app.UseCors();
app.UseMiddleware<ExceptionHandlingMiddleware>();


app.MapControllers();
app.MapGraphQL();
app.Run();
