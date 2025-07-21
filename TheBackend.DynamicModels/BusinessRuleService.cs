using Newtonsoft.Json;
using RulesEngine.Models;
using RulesEngine;

namespace TheBackend.DynamicModels;

public class BusinessRuleService
{
    private readonly string _rulesFile;
    private readonly List<Workflow> _workflows;
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
        var json = JsonConvert.SerializeObject(_workflows, Formatting.Indented);
        File.WriteAllText(_rulesFile, json);
        _engine = new RulesEngine.RulesEngine(_workflows.ToArray());
    }

    public List<Workflow> GetWorkflows() => _workflows;

    public void AddOrUpdateWorkflow(Workflow workflow)
    {
        var existing = _workflows.FirstOrDefault(w => w.WorkflowName == workflow.WorkflowName);
        if (existing != null) _workflows.Remove(existing);
        _workflows.Add(workflow);
        SaveWorkflows();
    }

    public bool HasWorkflow(string workflowName)
        => _workflows.Any(w => w.WorkflowName.Equals(workflowName, StringComparison.OrdinalIgnoreCase));

    public ValueTask<List<RuleResultTree>> ExecuteAsync(string workflowName, params RuleParameter[] parameters)
    {
        var workflow = _workflows.FirstOrDefault(w =>
            w.WorkflowName.Equals(workflowName, StringComparison.OrdinalIgnoreCase));

        if (workflow == null)
        {
            return ValueTask.FromResult(new List<RuleResultTree>());
        }

        return _engine.ExecuteAllRulesAsync(workflow.WorkflowName, parameters);
    }
}
