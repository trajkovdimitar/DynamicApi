using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;
using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using Polly;

namespace TheBackend.DynamicModels.Workflows;



public class WorkflowService
{
    private readonly List<WorkflowDefinition> _workflows;
    private readonly object _lock = new();
    private readonly WorkflowHistoryService _historyService;
    private readonly WorkflowStepExecutorRegistry _executorRegistry;
    private readonly ILogger<WorkflowService> _logger;

    public WorkflowService(
        WorkflowHistoryService historyService,
        WorkflowStepExecutorRegistry executorRegistry,
        ILogger<WorkflowService> logger)
    {
        _historyService = historyService;
        _executorRegistry = executorRegistry;
        _logger = logger;
        _workflows = historyService.LoadAllCurrentDefinitions();
    }

    private void Save(WorkflowDefinition def)
    {
        lock (_lock)
        {
            def.Version = _historyService.SaveDefinition(def);
        }
    }

    private void ValidateWorkflow(WorkflowDefinition def)
    {
        if (string.IsNullOrWhiteSpace(def.WorkflowName))
            throw new ArgumentException("WorkflowName is required");
        if (def.Steps == null || def.Steps.Count == 0)
            throw new ArgumentException("Workflow must contain at least one step");

        foreach (var variable in def.GlobalVariables)
        {
            _ = variable.GetTypedValue();
        }

        foreach (var step in def.Steps)
        {
            if (string.IsNullOrWhiteSpace(step.Type))
                throw new ArgumentException("Step type is required");
            if (_executorRegistry.GetExecutor(step.Type) == null)
                throw new ArgumentException($"Unsupported step type: {step.Type}");

            foreach (var p in step.Parameters)
            {
                _ = p.GetTypedValue();
            }

            if (!string.IsNullOrEmpty(step.Condition))
            {
                try
                {
                    CSharpScript.Create<bool>(step.Condition, ScriptOptions.Default).Compile();
                }
                catch (Exception ex)
                {
                    throw new ArgumentException($"Invalid condition on step {step.Type}: {ex.Message}");
                }
            }

            if (!string.IsNullOrEmpty(step.OnError))
            {
                var parts = step.OnError.Split(':', 2, StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
                var policy = parts[0];
                if (!policy.Equals("Retry", StringComparison.OrdinalIgnoreCase) &&
                    !policy.Equals("Skip", StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException($"Invalid OnError policy: {step.OnError}");
                if (policy.Equals("Retry", StringComparison.OrdinalIgnoreCase) && parts.Length > 1 && !int.TryParse(parts[1], out _))
                    throw new ArgumentException($"Invalid OnError retry count: {step.OnError}");
            }

            void Require(string name)
            {
                if (!step.Parameters.Any(p => p.Key.Equals(name, StringComparison.OrdinalIgnoreCase)))
                    throw new ArgumentException($"Step {step.Type} missing parameter {name}");
            }

            switch (step.Type)
            {
                case "CreateEntity":
                    Require("ModelName");
                    break;
                case "UpdateEntity":
                    Require("ModelName");
                    Require("Id");
                    break;
                case "QueryEntity":
                    Require("ModelName");
                    break;
                case "SendEmail":
                    Require("To");
                    break;
                case "LogEvent":
                    Require("Message");
                    break;
            }
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
            ValidateWorkflow(def);
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
        var variables = wf.GlobalVariables.ToDictionary(v => v.Key, v => v.GetTypedValue()!);

        var db = dbContextService.GetDbContext();
        using var transaction = wf.IsTransactional ? await db.Database.BeginTransactionAsync() : null;

        try
        {
            foreach (var step in wf.Steps)
            {
                if (!string.IsNullOrEmpty(step.Condition) &&
                    !await EvaluateConditionAsync(step.Condition, current, variables))
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

                current = await HandleStepError(
                    async () => (object?)await ((dynamic)executor).ExecuteAsync(
                        (dynamic)current,
                        step,
                        dbContextService,
                        serviceProvider,
                        variables),
                    step,
                    current);
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

    private async Task<bool> EvaluateConditionAsync(
        string condition,
        object? current,
        Dictionary<string, object> variables)
    {
        if (string.IsNullOrEmpty(condition))
            return true;

        var globals = new { Input = current, Vars = variables };
        try
        {
            return await CSharpScript.EvaluateAsync<bool>(condition, ScriptOptions.Default, globals);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Condition eval failed: {Condition}", condition);
            return false;
        }
    }

    private async Task<object?> HandleStepError(Func<Task<object?>> action, WorkflowStep step, object? current)
    {
        if (string.IsNullOrWhiteSpace(step.OnError))
            return await action();

        var parts = step.OnError.Split(
            ':',
            2,
            StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        var policy = parts[0];

        if (policy.Equals("Retry", StringComparison.OrdinalIgnoreCase))
        {
            var retries = parts.Length > 1 && int.TryParse(parts[1], out var r) ? r : 1;
            var polly = Policy
                .Handle<Exception>()
                .RetryAsync(
                    retries,
                    (ex, attempt) =>
                        _logger.LogWarning(
                            ex,
                            "Retry {Attempt} for step {Type}",
                            attempt,
                            step.Type));
            return await polly.ExecuteAsync(action);
        }

        if (policy.Equals("Skip", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                return await action();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Step {Type} failed but skipping", step.Type);
                return current;
            }
        }

        return await action();
    }
}
