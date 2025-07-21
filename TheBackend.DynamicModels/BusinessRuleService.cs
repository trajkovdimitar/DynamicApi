using Newtonsoft.Json;
using RulesEngine.Models;
using RulesEngine;

namespace TheBackend.DynamicModels;

public class BusinessRuleService
{
    private const string RulesFile = "rules.json";
    private readonly List<Workflow> _workflows;
    private RulesEngine.RulesEngine _engine;

    public BusinessRuleService()
    {
        _workflows = LoadWorkflows();
        _engine = new RulesEngine.RulesEngine(_workflows.ToArray());
    }

    private static List<Workflow> LoadWorkflows()
    {
        if (!File.Exists(RulesFile)) return new List<Workflow>();
        var json = File.ReadAllText(RulesFile);
        return JsonConvert.DeserializeObject<List<Workflow>>(json) ?? new List<Workflow>();
    }

    private void SaveWorkflows()
    {
        var json = JsonConvert.SerializeObject(_workflows, Formatting.Indented);
        File.WriteAllText(RulesFile, json);
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
        => _engine.ExecuteAllRulesAsync(workflowName, parameters);
}
