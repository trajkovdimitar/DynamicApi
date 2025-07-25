using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using TheBackend.Domain.Models;

namespace TheBackend.DynamicModels.Workflows;

public class WorkflowHistoryService
{
    private readonly DbContextOptions<ModelHistoryDbContext> _options;

    public WorkflowHistoryService(IConfiguration config, string? dbName = null)
    {
        var builder = new DbContextOptionsBuilder<ModelHistoryDbContext>();
        var connString = config.GetConnectionString("Default");
        var provider = config["DbProvider"];
        if (provider == "SqlServer")
            builder.UseSqlServer(connString);
        else if (provider == "Postgres")
            builder.UseNpgsql(connString);
        else
            builder.UseInMemoryDatabase(dbName ?? "ModelHistory");
        _options = builder.Options;

        using var ctx = new ModelHistoryDbContext(_options);
        ctx.Database.EnsureCreated();
    }

    public List<WorkflowDefinition> LoadDefinitions(string? file)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var defs = ctx.WorkflowDefinitions
            .AsEnumerable()
            .Select(d =>
            {
                var def = JsonConvert.DeserializeObject<WorkflowDefinition>(d.Definition)!;
                def.Version = d.Version;
                return def;
            })
            .ToList();
        if (defs.Count == 0 && file != null && File.Exists(file))
        {
            var json = File.ReadAllText(file);
            defs = JsonConvert.DeserializeObject<List<WorkflowDefinition>>(json) ?? new();
            foreach (var def in defs)
            {
                def.Version = SaveDefinition(def);
            }
        }
        return defs;
    }

    public int SaveDefinition(WorkflowDefinition def)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var json = JsonConvert.SerializeObject(def);
        var existing = ctx.WorkflowDefinitions
            .FirstOrDefault(x => x.WorkflowName.ToLower() == def.WorkflowName.ToLower());
        var version = existing == null ? 1 : existing.Version + 1;
        if (existing == null)
            ctx.WorkflowDefinitions.Add(new WorkflowDefinitionRecord { WorkflowName = def.WorkflowName, Definition = json, Version = version });
        else
        {
            existing.Definition = json;
            existing.Version = version;
        }
        ctx.SaveChanges();
        return version;
    }

    public void RecordChange(WorkflowDefinition def, string action, string hash, int version)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var entry = new WorkflowHistory
        {
            WorkflowName = def.WorkflowName,
            Action = action,
            Definition = JsonConvert.SerializeObject(def),
            Hash = hash,
            Timestamp = DateTime.UtcNow,
            Version = version
        };
        ctx.WorkflowHistories.Add(entry);
        ctx.SaveChanges();
    }

    public WorkflowDefinition? GetVersion(string workflowName, int version)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var entry = ctx.WorkflowHistories
            .Where(h => h.WorkflowName == workflowName && h.Version == version)
            .OrderByDescending(h => h.Timestamp)
            .FirstOrDefault();
        if (entry == null)
            return null;
        var def = JsonConvert.DeserializeObject<WorkflowDefinition>(entry.Definition)!;
        def.Version = entry.Version;
        return def;
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
