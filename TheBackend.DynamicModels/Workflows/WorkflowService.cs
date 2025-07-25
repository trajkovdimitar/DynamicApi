using Newtonsoft.Json;
using TheBackend.DynamicModels;

namespace TheBackend.DynamicModels.Workflows;

public class WorkflowDefinition
{
    public string WorkflowName { get; set; } = string.Empty;
    public List<WorkflowStep> Steps { get; set; } = new();
}

public class WorkflowStep
{
    public string Type { get; set; } = string.Empty;
}

public class WorkflowService
{
    private readonly string _file;
    private readonly List<WorkflowDefinition> _workflows;
    private readonly object _lock = new();

    public WorkflowService(string? file = null)
    {
        _file = file ?? "workflows.json";
        _workflows = Load(_file);
    }

    private static List<WorkflowDefinition> Load(string file)
    {
        if (!File.Exists(file)) return new();
        var json = File.ReadAllText(file);
        return JsonConvert.DeserializeObject<List<WorkflowDefinition>>(json) ?? new();
    }

    private void Save()
    {
        lock (_lock)
        {
            var json = JsonConvert.SerializeObject(_workflows, Formatting.Indented);
            File.WriteAllText(_file, json);
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
            Save();
        }
    }

    public async Task RunAsync(string workflowName, DynamicDbContextService dbContextService, object entity)
    {
        var wf = GetWorkflow(workflowName);
        if (wf == null) return;
        foreach (var step in wf.Steps)
        {
            if (step.Type.Equals("CreateInvoice", StringComparison.OrdinalIgnoreCase))
            {
                var type = dbContextService.GetModelType("Invoice");
                if (type == null) continue;
                var db = dbContextService.GetDbContext();
                var invoice = Activator.CreateInstance(type)!;
                var orderIdProp = entity.GetType().GetProperty("OrderId");
                type.GetProperty("OrderId")?.SetValue(invoice, orderIdProp?.GetValue(entity));
                type.GetProperty("InvoiceDate")?.SetValue(invoice, DateTime.UtcNow);
                var amountProp = entity.GetType().GetProperty("Amount");
                type.GetProperty("Total")?.SetValue(invoice, amountProp?.GetValue(entity));
                db.Add(invoice);
                await db.SaveChangesAsync();
            }
        }
    }
}
