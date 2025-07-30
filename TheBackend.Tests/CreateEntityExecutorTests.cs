using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TheBackend.DynamicModels;
using TheBackend.DynamicModels.Workflows;
using Xunit;
using System;
using System.Collections.Generic;

namespace TheBackend.Tests;

public class CreateEntityExecutorTests
{
    private class RequiredEntity
    {
        public int Id { get; set; }
        public string? Name { get; set; }
    }

    private class RequiredDbContext : DbContext
    {
        public DbSet<RequiredEntity> RequiredEntities { get; set; } = null!;

        public RequiredDbContext(DbContextOptions<RequiredDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RequiredEntity>().Property(e => e.Name).IsRequired();
        }
    }

    private static DynamicDbContextService CreateService()
    {
        var modelService = new ModelDefinitionService();
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DbProvider"] = "InMemory",
                ["ConnectionStrings:Default"] = Guid.NewGuid().ToString()
            })
            .Build();
        var history = new ModelHistoryService(config);
        var service = new DynamicDbContextService(modelService, config, history);
        typeof(DynamicDbContextService)
            .GetField("_dynamicAssembly", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(RequiredEntity).Assembly);
        typeof(DynamicDbContextService)
            .GetField("_dynamicDbContextType", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(RequiredDbContext));
        return service;
    }

    [Fact]
    public async Task ExecuteAsync_Throws_WhenRequiredPropertyMissing()
    {
        using var service = CreateService();
        var executor = new CreateEntityExecutor<object, RequiredEntity>();
        var step = new WorkflowStep
        {
            Type = executor.SupportedType,
            Parameters = new List<Parameter>
            {
                new() { Key = "ModelName", ValueType = "string", Value = nameof(RequiredEntity) }
            }
        };

        await Assert.ThrowsAsync<ArgumentException>(() => executor.ExecuteAsync(null, step, service, new ServiceCollection().BuildServiceProvider(), new Dictionary<string, object>()));
    }

}
