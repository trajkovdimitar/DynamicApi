using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;

namespace TheBackend.DynamicModels.Workflows;

public class WorkflowDefinition
{
    public string WorkflowName { get; set; } = string.Empty;
    public List<WorkflowStep> Steps { get; set; } = new();
    public int Version { get; set; }
    public bool IsTransactional { get; set; } = true;
    public Dictionary<string, object> GlobalVariables { get; set; } = new();
}

public class WorkflowStep
{
    public string Type { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();
    public string? Condition { get; set; }
    public string? OnError { get; set; }
    public string? OutputVariable { get; set; }
}

public class WorkflowService
{
    private readonly string _file;
    private readonly List<WorkflowDefinition> _workflows;
    private readonly object _lock = new();
    private readonly WorkflowHistoryService _historyService;
    private readonly WorkflowStepExecutorRegistry _executorRegistry;
    private readonly ILogger<WorkflowService> _logger;

    public WorkflowService(
        IConfiguration config,
        WorkflowHistoryService historyService,
        WorkflowStepExecutorRegistry executorRegistry,
        ILogger<WorkflowService> logger,
        string? file = null)
    {
        _file = file ?? "workflows.json";
        _historyService = historyService;
        _executorRegistry = executorRegistry;
        _logger = logger;
        _workflows = historyService.LoadDefinitions(_file);
    }

    private void Save(WorkflowDefinition def)
    {
        lock (_lock)
        {
            var json = JsonConvert.SerializeObject(_workflows, Formatting.Indented);
            File.WriteAllText(_file, json);
            def.Version = _historyService.SaveDefinition(def);
        }
    }

    public IEnumerable<WorkflowDefinition> GetWorkflows()
    {
        lock (_lock)
            return _workflows.ToList();
    }

    public WorkflowDefinition? GetWorkflow(string name)
    {
        lock (_lock)
            return _workflows.FirstOrDefault(x => x.WorkflowName.Equals(name, StringComparison.OrdinalIgnoreCase));
    }

    public void SaveWorkflow(WorkflowDefinition def)
    {
        lock (_lock)
        {
            var existing = _workflows.FirstOrDefault(x => x.WorkflowName.Equals(def.WorkflowName, StringComparison.OrdinalIgnoreCase));
            if (existing != null) _workflows.Remove(existing);
            _workflows.Add(def);
            Save(def);
            var hash = ComputeHash(JsonConvert.SerializeObject(def));
            var action = existing == null ? "Created" : "Updated";
            _historyService.RecordChange(def, action, hash, def.Version);
        }
    }

    public bool RollbackWorkflow(string workflowName, int version)
    {
        lock (_lock)
        {
            var target = _historyService.GetVersion(workflowName, version);
            if (target == null)
                return false;

            var existing = _workflows.FirstOrDefault(x => x.WorkflowName.Equals(workflowName, StringComparison.OrdinalIgnoreCase));
            if (existing != null) _workflows.Remove(existing);
            _workflows.Add(target);
            Save(target);
            var hash = ComputeHash(JsonConvert.SerializeObject(target));
            _historyService.RecordChange(target, "RolledBack", hash, target.Version);
            return true;
        }
    }

    private static string ComputeHash(string content)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(content);
        return Convert.ToHexString(sha.ComputeHash(bytes));
    }

    public async Task<object?> RunAsync(
        string workflowName,
        DynamicDbContextService dbContextService,
        object entity,
        IServiceProvider serviceProvider)
    {
        var wf = GetWorkflow(workflowName);
        if (wf == null) return null;

        _logger.LogInformation("Starting workflow {Name} v{Version}", workflowName, wf.Version);

        object? current = entity;
        var variables = wf.GlobalVariables.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

        var db = dbContextService.GetDbContext();
        using var transaction = wf.IsTransactional ? await db.Database.BeginTransactionAsync() : null;

        try
        {
            foreach (var step in wf.Steps)
            {
                if (!string.IsNullOrEmpty(step.Condition) && !EvaluateCondition(step.Condition, current, variables))
                {
                    _logger.LogInformation("Skipping step {Type} due to condition", step.Type);
                    continue;
                }

                var executor = _executorRegistry.GetExecutor(step.Type);
                if (executor == null)
                {
                    _logger.LogWarning("No executor for step {Type}; skipping", step.Type);
                    continue;
                }

                current = await executor.ExecuteAsync(current, step, dbContextService, serviceProvider, variables);
                if (!string.IsNullOrEmpty(step.OutputVariable))
                    variables[step.OutputVariable] = current!;
            }

            if (transaction != null)
                await transaction.CommitAsync();

            _logger.LogInformation("Completed workflow {Name}", workflowName);
            return current;
        }
        catch
        {
            if (transaction != null)
                await transaction.RollbackAsync();
            throw;
        }
    }

    private static bool EvaluateCondition(string condition, object? current, Dictionary<string, object> variables)
    {
        // TODO: implement real evaluation
        return true;
    }
}
