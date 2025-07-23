using Newtonsoft.Json;
using RulesEngine.Models;
using RulesEngine;

namespace TheBackend.DynamicModels;

public class BusinessRuleService
{
    private readonly string _rulesFile;
    private readonly List<Workflow> _workflows;
    private readonly object _lock = new();
    private RulesEngine.RulesEngine _engine;

    public BusinessRuleService(string? rulesFile = null)
    {
        _rulesFile = rulesFile ?? "rules.json";
        _workflows = LoadWorkflows(_rulesFile);
        _engine = new RulesEngine.RulesEngine(_workflows.ToArray());
    }

    private static List<Workflow> LoadWorkflows(string file)
    {
        if (!File.Exists(file)) return new List<Workflow>();
        var json = File.ReadAllText(file);
        return JsonConvert.DeserializeObject<List<Workflow>>(json) ?? new List<Workflow>();
    }

    private void SaveWorkflows()
    {
        lock (_lock)
        {
            var json = JsonConvert.SerializeObject(_workflows, Formatting.Indented);
            File.WriteAllText(_rulesFile, json);
            _engine = new RulesEngine.RulesEngine(_workflows.ToArray());
        }
    }

    public string ComputeRulesHash()
    {
        if (!File.Exists(_rulesFile)) return string.Empty;
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = File.ReadAllBytes(_rulesFile);
        return Convert.ToHexString(sha.ComputeHash(bytes));
    }

    public List<Workflow> GetWorkflows()
    {
        lock (_lock)
        {
            return new List<Workflow>(_workflows);
        }
    }

    public void AddOrUpdateWorkflow(Workflow workflow)
    {
        lock (_lock)
        {
            var existing = _workflows.FirstOrDefault(
                w => w.WorkflowName.Equals(workflow.WorkflowName, StringComparison.OrdinalIgnoreCase));
            if (existing != null) _workflows.Remove(existing);
            _workflows.Add(workflow);
        }
        SaveWorkflows();
    }

    public bool HasWorkflow(string workflowName)
        => _workflows.Any(w => w.WorkflowName.Equals(workflowName, StringComparison.OrdinalIgnoreCase));

    public ValueTask<List<RuleResultTree>> ExecuteAsync(string workflowName, params RuleParameter[] parameters)
    {
        var actualName = _workflows
            .FirstOrDefault(w => w.WorkflowName.Equals(workflowName, StringComparison.OrdinalIgnoreCase))
            ?.WorkflowName ?? workflowName;
        return _engine.ExecuteAllRulesAsync(actualName, parameters);
    }
}
