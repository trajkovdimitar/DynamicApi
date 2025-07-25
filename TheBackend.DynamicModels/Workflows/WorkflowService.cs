using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using System.Collections.Generic;

namespace TheBackend.DynamicModels.Workflows;

public class WorkflowDefinition
{
    public string WorkflowName { get; set; } = string.Empty;
    public List<WorkflowStep> Steps { get; set; } = new();
    public int Version { get; set; }
}

public class WorkflowStep
{
    public string Type { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class WorkflowService
{
    private readonly string _file;
    private readonly List<WorkflowDefinition> _workflows;
    private readonly object _lock = new();
    private readonly WorkflowHistoryService _historyService;
    private readonly WorkflowStepExecutorRegistry _executorRegistry;

    public WorkflowService(
        IConfiguration config,
        WorkflowHistoryService historyService,
        WorkflowStepExecutorRegistry executorRegistry,
        string? file = null)
    {
        _file = file ?? "workflows.json";
        _historyService = historyService;
        _executorRegistry = executorRegistry;
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

    public async Task RunAsync(
        string workflowName,
        DynamicDbContextService dbContextService,
        object entity,
        IServiceProvider serviceProvider)
    {
        var wf = GetWorkflow(workflowName);
        if (wf == null) return;

        object? current = entity;
        foreach (var step in wf.Steps)
        {
            var executor = _executorRegistry.GetExecutor(step.Type);
            if (executor == null) continue;
            current = await executor.ExecuteAsync(current, step, dbContextService, serviceProvider);
        }
    }
}
