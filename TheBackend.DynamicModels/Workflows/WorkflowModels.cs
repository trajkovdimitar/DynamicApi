using System.Text.Json;
using System.Text.Json.Serialization;

namespace TheBackend.DynamicModels.Workflows;

public class WorkflowDefinition
{
    public string WorkflowName { get; set; } = string.Empty;
    public List<WorkflowStep> Steps { get; set; } = new();
    public int Version { get; set; }
    public bool IsTransactional { get; set; } = true;
    public List<GlobalVariable> GlobalVariables { get; set; } = new();
}

public class GlobalVariable
{
    public string Key { get; set; } = string.Empty;
    public string ValueType { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;

    public object? GetTypedValue() => ValueType switch
    {
        "int" => int.TryParse(Value, out var i) ? i : Value,
        "bool" => bool.TryParse(Value, out var b) ? b : Value,
        "double" => double.TryParse(Value, out var d) ? d : Value,
        "json" => JsonSerializer.Deserialize<object>(Value),
        _ => Value,
    };
}

public class WorkflowStep
{
    public string Type { get; set; } = string.Empty;
    [JsonConverter(typeof(ParameterListJsonConverter))]
    public List<Parameter> Parameters { get; set; } = new();
    public string? Condition { get; set; }
    public string? OnError { get; set; }
    public string? OutputVariable { get; set; }
}

public class Parameter
{
    public string Key { get; set; } = string.Empty;
    public string ValueType { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;

    public object? GetTypedValue() => ValueType switch
    {
        "int" => int.TryParse(Value, out var i) ? i : Value,
        "bool" => bool.TryParse(Value, out var b) ? b : Value,
        "double" => double.TryParse(Value, out var d) ? d : Value,
        "json" => JsonSerializer.Deserialize<object>(Value),
        _ => Value,
    };
}
