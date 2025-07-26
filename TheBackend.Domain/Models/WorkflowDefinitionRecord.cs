namespace TheBackend.Domain.Models;

public class WorkflowDefinitionRecord
{
    public int Id { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public int Version { get; set; }
    public bool IsTransactional { get; set; } = true;
    public ICollection<GlobalVariableRecord> GlobalVariables { get; set; } = new List<GlobalVariableRecord>();
    public ICollection<WorkflowStepRecord> Steps { get; set; } = new List<WorkflowStepRecord>();
}

public class GlobalVariableRecord
{
    public int Id { get; set; }
    public int WorkflowDefinitionId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string ValueType { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public WorkflowDefinitionRecord? WorkflowDefinition { get; set; }
}

public class WorkflowStepRecord
{
    public int Id { get; set; }
    public int WorkflowDefinitionId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Condition { get; set; }
    public string? OnError { get; set; }
    public string? OutputVariable { get; set; }
    public WorkflowDefinitionRecord? WorkflowDefinition { get; set; }
    public ICollection<ParameterRecord> Parameters { get; set; } = new List<ParameterRecord>();
}

public class ParameterRecord
{
    public int Id { get; set; }
    public int WorkflowStepId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string ValueType { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public WorkflowStepRecord? WorkflowStep { get; set; }
}

public class WorkflowHistoryRecord
{
    public int Id { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public int Version { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Hash { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
