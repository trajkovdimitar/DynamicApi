using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
        return ctx.WorkflowDefinitions
            .Include(d => d.GlobalVariables)
            .Include(d => d.Steps).ThenInclude(s => s.Parameters)
            .Select(MapToDomain)
            .ToList();
    }

    public List<WorkflowDefinition> LoadAllCurrentDefinitions()
    {
        using var db = new ModelHistoryDbContext(_options);
        return db.WorkflowDefinitions
            .Include(d => d.GlobalVariables)
            .Include(d => d.Steps).ThenInclude(s => s.Parameters)
            .AsEnumerable()
            .GroupBy(w => w.WorkflowName)
            .Select(g => g.OrderByDescending(w => w.Version).First())
            .Select(MapToDomain)
            .ToList();
    }

    public int SaveDefinition(WorkflowDefinition def)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var existingVersions = ctx.WorkflowDefinitions
            .Where(d => d.WorkflowName == def.WorkflowName)
            .Select(d => d.Version)
            .ToList();
        var version = existingVersions.Any() ? existingVersions.Max() + 1 : 1;

        var record = MapToRecord(def, version);
        ctx.WorkflowDefinitions.Add(record);
        ctx.SaveChanges();
        return version;
    }

    public void RecordChange(WorkflowDefinition def, string action, string hash, int version)
    {
        using var ctx = new ModelHistoryDbContext(_options);
        var entry = new WorkflowHistoryRecord
        {
            WorkflowName = def.WorkflowName,
            Action = action,
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
        var record = ctx.WorkflowDefinitions
            .Include(d => d.GlobalVariables)
            .Include(d => d.Steps).ThenInclude(s => s.Parameters)
            .FirstOrDefault(d => d.WorkflowName == workflowName && d.Version == version);
        return record == null ? null : MapToDomain(record);
    }

    public string? GetLastHash()
    {
        using var ctx = new ModelHistoryDbContext(_options);
        return ctx.WorkflowHistories
            .OrderByDescending(h => h.Timestamp)
            .Select(h => h.Hash)
            .FirstOrDefault();
    }

    private static WorkflowDefinition MapToDomain(WorkflowDefinitionRecord record)
    {
        return new WorkflowDefinition
        {
            WorkflowName = record.WorkflowName,
            Version = record.Version,
            IsTransactional = record.IsTransactional,
            GlobalVariables = record.GlobalVariables.Select(v => new GlobalVariable
            {
                Key = v.Key,
                ValueType = v.ValueType,
                Value = v.Value
            }).ToList(),
            Steps = record.Steps.Select(MapStep).ToList()
        };
    }

    private static WorkflowStep MapStep(WorkflowStepRecord record)
    {
        return new WorkflowStep
        {
            Type = record.Type,
            Condition = record.Condition,
            OnError = record.OnError,
            OutputVariable = record.OutputVariable,
            Parameters = record.Parameters.Select(p => new Parameter
            {
                Key = p.Key,
                ValueType = p.ValueType,
                Value = p.Value
            }).ToList()
        };
    }

    private static WorkflowDefinitionRecord MapToRecord(WorkflowDefinition def, int version)
    {
        return new WorkflowDefinitionRecord
        {
            WorkflowName = def.WorkflowName,
            Version = version,
            IsTransactional = def.IsTransactional,
            GlobalVariables = def.GlobalVariables.Select(v => new GlobalVariableRecord
            {
                Key = v.Key,
                ValueType = v.ValueType,
                Value = v.Value
            }).ToList(),
            Steps = def.Steps.Select(s => new WorkflowStepRecord
            {
                Type = s.Type,
                Condition = s.Condition,
                OnError = s.OnError,
                OutputVariable = s.OutputVariable,
                Parameters = s.Parameters.Select(p => new ParameterRecord
                {
                    Key = p.Key,
                    ValueType = p.ValueType,
                    Value = p.Value
                }).ToList()
            }).ToList()
        };
    }
}
