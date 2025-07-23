using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using RulesEngine.Models;
using TheBackend.Domain.Models;

namespace TheBackend.DynamicModels;

public class RuleHistoryService
{
    private readonly DbContextOptions<ModelHistoryDbContext> _options;

    public RuleHistoryService(IConfiguration config)
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

    public string? GetLastHash()
    {
        using var ctx = new ModelHistoryDbContext(_options);
        return ctx.RuleHistories
            .OrderByDescending(h => h.Timestamp)
            .Select(h => h.Hash)
            .FirstOrDefault();
    }

    public void RecordRuleChange(Workflow workflow, string action, string hash)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var entry = new RuleHistory
        {
            WorkflowName = workflow.WorkflowName,
            Action = action,
            Definition = JsonConvert.SerializeObject(workflow),
            Hash = hash,
            Timestamp = DateTime.UtcNow
        };
        ctx.RuleHistories.Add(entry);
        ctx.SaveChanges();
    }
}
