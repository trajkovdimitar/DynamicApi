using Newtonsoft.Json;
using RulesEngine.Models;
using RulesEngine;
using System.IO;
using System.Threading.Tasks;

namespace TheBackend.DynamicModels;

public class BusinessRuleService
{
    private readonly string _rulesFile;
    private readonly List<Workflow> _workflows;
    private RulesEngine.RulesEngine _engine;

    public BusinessRuleService(string? rulesFile = null)
    {
        _rulesFile = rulesFile ?? "rules.json";
        _workflows = LoadWorkflowsAsync(_rulesFile).GetAwaiter().GetResult();
        _engine = new RulesEngine.RulesEngine(_workflows.ToArray());
    }

    private static async Task<List<Workflow>> LoadWorkflowsAsync(string file)
    {
        if (!File.Exists(file)) return new List<Workflow>();
        var json = await File.ReadAllTextAsync(file);
        return JsonConvert.DeserializeObject<List<Workflow>>(json) ?? new List<Workflow>();
    }

    private async Task SaveWorkflowsAsync()
    {
        var json = JsonConvert.SerializeObject(_workflows, Formatting.Indented);
        await File.WriteAllTextAsync(_rulesFile, json);
        _engine = new RulesEngine.RulesEngine(_workflows.ToArray());
    }

    public List<Workflow> GetWorkflows() => _workflows;

    public async Task AddOrUpdateWorkflowAsync(Workflow workflow)
    {
        var existing = _workflows.FirstOrDefault(
            w => w.WorkflowName.Equals(workflow.WorkflowName, StringComparison.OrdinalIgnoreCase));
        if (existing != null) _workflows.Remove(existing);
        _workflows.Add(workflow);
        await SaveWorkflowsAsync();
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
