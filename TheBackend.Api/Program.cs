using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using TheBackend.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TheBackend.Application.Auth;
using TheBackend.Infrastructure.Auth;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<ModelDefinitionService>();
builder.Services.AddSingleton<DynamicDbContextService>();
builder.Services.AddSingleton<BusinessRuleService>();
builder.Services.AddTransient<ExceptionHandlingMiddleware>();
builder.Services.AddSingleton<IUserRepository, InMemoryUserRepository>();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var parameters = new AuthService(new InMemoryUserRepository()).GetValidationParameters();
        options.TokenValidationParameters = parameters;
    });
builder.Services.AddAuthorization();

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
app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();
app.Run();
