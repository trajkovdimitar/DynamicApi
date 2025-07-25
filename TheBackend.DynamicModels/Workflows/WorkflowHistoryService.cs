using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using TheBackend.Domain.Models;

namespace TheBackend.DynamicModels.Workflows;

public class WorkflowHistoryService
{
    private readonly DbContextOptions<ModelHistoryDbContext> _options;

    public WorkflowHistoryService(IConfiguration config)
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
        ctx.Database.EnsureCreated();
    }

    public List<WorkflowDefinition> LoadDefinitions(string? file)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var defs = ctx.WorkflowDefinitions
            .Select(d => JsonConvert.DeserializeObject<WorkflowDefinition>(d.Definition)!)
            .ToList();
        if (defs.Count == 0 && file != null && File.Exists(file))
        {
            var json = File.ReadAllText(file);
            defs = JsonConvert.DeserializeObject<List<WorkflowDefinition>>(json) ?? new();
            foreach (var def in defs)
                SaveDefinition(def);
        }
        return defs;
    }

    public void SaveDefinition(WorkflowDefinition def)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var json = JsonConvert.SerializeObject(def);
        var existing = ctx.WorkflowDefinitions
            .FirstOrDefault(x => x.WorkflowName.Equals(def.WorkflowName, StringComparison.OrdinalIgnoreCase));
        if (existing == null)
            ctx.WorkflowDefinitions.Add(new WorkflowDefinitionRecord { WorkflowName = def.WorkflowName, Definition = json });
        else
            existing.Definition = json;
        ctx.SaveChanges();
    }

    public void RecordChange(WorkflowDefinition def, string action, string hash)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var entry = new WorkflowHistory
        {
            WorkflowName = def.WorkflowName,
            Action = action,
            Definition = JsonConvert.SerializeObject(def),
            Hash = hash,
            Timestamp = DateTime.UtcNow
        };
        ctx.WorkflowHistories.Add(entry);
        ctx.SaveChanges();
    }

    public string? GetLastHash()
    {
        using var ctx = new ModelHistoryDbContext(_options);
        return ctx.WorkflowHistories
            .OrderByDescending(h => h.Timestamp)
            .Select(h => h.Hash)
            .FirstOrDefault();
    }
}
