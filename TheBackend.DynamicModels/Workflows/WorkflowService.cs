using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using TheBackend.DynamicModels;
using TheBackend.Domain.Models;

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
}

public class WorkflowService
{
    private readonly string _file;
    private readonly List<WorkflowDefinition> _workflows;
    private readonly object _lock = new();
    private readonly WorkflowHistoryService _historyService;

    public WorkflowService(IConfiguration config, WorkflowHistoryService historyService, string? file = null)
    {
        _file = file ?? "workflows.json";
        _historyService = historyService;
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
                entity = invoice;
            }
            else if (step.Type.Equals("CreatePost", StringComparison.OrdinalIgnoreCase))
            {
                var type = dbContextService.GetModelType("Post");
                if (type == null) continue;
                var db = dbContextService.GetDbContext();
                var post = Activator.CreateInstance(type)!;
                var idProp = entity.GetType().GetProperty("Id");
                type.GetProperty("UserId")?.SetValue(post, idProp?.GetValue(entity));
                type.GetProperty("Title")?.SetValue(post, "Auto generated post");
                type.GetProperty("Content")?.SetValue(post, "Created via workflow");
                db.Add(post);
                await db.SaveChangesAsync();
                entity = post;
            }
            else if (step.Type.Equals("CreateComment", StringComparison.OrdinalIgnoreCase))
            {
                var type = dbContextService.GetModelType("Comment");
                if (type == null) continue;
                var db = dbContextService.GetDbContext();
                var comment = Activator.CreateInstance(type)!;
                var postIdProp = entity.GetType().GetProperty("Id");
                type.GetProperty("PostId")?.SetValue(comment, postIdProp?.GetValue(entity));
                type.GetProperty("Content")?.SetValue(comment, "Auto comment");
                db.Add(comment);
                await db.SaveChangesAsync();
                entity = comment;
            }
        }
    }
}
