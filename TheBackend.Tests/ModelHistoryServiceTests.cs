using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using TheBackend.Domain.Models;
using TheBackend.DynamicModels;
using Xunit;

namespace TheBackend.Tests;

public class ModelHistoryServiceTests
{
    [Fact]
    public void EnsureHistory_CreatesEntriesOnlyOnce()
    {
        var models = new List<ModelDefinition>
        {
            new ModelDefinition { ModelName = "Test", Properties = new List<PropertyDefinition>() }
        };

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DbProvider"] = "InMemory",
                ["ConnectionStrings:Default"] = Guid.NewGuid().ToString()
            })
            .Build();

        var service = new ModelHistoryService(config);
        service.EnsureHistory(models, "hash");
        service.EnsureHistory(models, "hash");

        var options = new DbContextOptionsBuilder<ModelHistoryDbContext>()
            .UseInMemoryDatabase("ModelHistory")
            .Options;
        using var ctx = new ModelHistoryDbContext(options);
        var entries = ctx.ModelHistories.ToList();
        Assert.Equal(2, entries.Count);
        Assert.Contains(entries, e => e.Action == "Created" && e.ModelName == "Test");
        Assert.Contains(entries, e => e.Action == "Snapshot");
    }
}
