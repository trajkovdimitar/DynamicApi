using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using TheBackend.Domain.Models;

namespace TheBackend.DynamicModels;

public class ModelHistoryService
{
    private readonly DbContextOptions<ModelHistoryDbContext> _options;

    public ModelHistoryService(IConfiguration config)
    {
        var builder = new DbContextOptionsBuilder<ModelHistoryDbContext>();
        var connString = config.GetConnectionString("Default");
        var provider = config["DbProvider"];
        if (provider == "SqlServer")
            builder.UseSqlServer(connString);
        else if (provider == "Postgres")
            builder.UseNpgsql(connString);
        else
            builder.UseInMemoryDatabase("ModelHistory");
        _options = builder.Options;

        using var ctx = new ModelHistoryDbContext(_options);
        if (provider == "SqlServer" || provider == "Postgres")
            ctx.Database.Migrate();
        ctx.Database.EnsureCreated();
    }

    public string? GetLastHash()
    {
        using var ctx = new ModelHistoryDbContext(_options);
        return ctx.ModelHistories
            .OrderByDescending(h => h.Timestamp)
            .Select(h => h.Hash)
            .FirstOrDefault();
    }

    public void RecordSnapshot(string hash)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var entry = new ModelHistory
        {
            ModelName = string.Empty,
            Action = "Snapshot",
            Definition = string.Empty,
            Hash = hash,
            Timestamp = DateTime.UtcNow
        };
        ctx.ModelHistories.Add(entry);
        ctx.SaveChanges();
    }

    public void RecordModelChange(ModelDefinition definition, string action, string hash)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var entry = new ModelHistory
        {
            ModelName = definition.ModelName,
            Action = action,
            Definition = JsonConvert.SerializeObject(definition),
            Hash = hash,
            Timestamp = DateTime.UtcNow
        };
        ctx.ModelHistories.Add(entry);
        ctx.SaveChanges();
    }
}
