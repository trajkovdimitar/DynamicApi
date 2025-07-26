using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace TheBackend.DynamicModels.Workflows;

public class CreateEntityExecutor<TInput, TOutput> : IWorkflowStepExecutor<TInput, TOutput>
    where TOutput : class
{
    public string SupportedType => "CreateEntity";

    public async Task<TOutput?> ExecuteAsync(
        TInput? inputEntity,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables)
    {
        var paramDict = step.Parameters.ToDictionary(p => p.Key, p => p.GetTypedValue());

        if (!paramDict.TryGetValue("ModelName", out var modelNameObj) || modelNameObj is not string modelName)
            throw new InvalidOperationException("Missing ModelName parameter.");

        var modelType = dbContextService.GetModelType(modelName) ?? throw new InvalidOperationException($"Model {modelName} not found.");
        var newEntity = Activator.CreateInstance(modelType)!;
        var inputType = inputEntity?.GetType();

        IEnumerable<Dictionary<string, object>> mappings = Enumerable.Empty<Dictionary<string, object>>();
        if (paramDict.TryGetValue("Mappings", out var mappingsObj))
        {
            if (mappingsObj is IEnumerable<object> list)
            {
                mappings = list.OfType<Dictionary<string, object>>();
            }
            else if (mappingsObj is System.Text.Json.JsonElement elem && elem.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                mappings = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(elem.GetRawText()) ?? new();
            }
            else if (mappingsObj is string str)
            {
                mappings = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(str) ?? new();
            }
        }

        foreach (var mapping in mappings)
        {
            if (!mapping.TryGetValue("To", out var toObj) || toObj is not string toPropName)
                continue;

            var targetProp = modelType.GetProperty(toPropName);
            if (targetProp == null) continue;

            object? value = null;
            if (mapping.TryGetValue("SourceType", out var stObj) && stObj is string st)
            {
                switch (st)
                {
                    case "Constant":
                        if (mapping.TryGetValue("Value", out var constVal))
                            value = constVal;
                        break;
                    case "Function":
                        if (mapping.TryGetValue("Value", out var func) && func is string funcName)
                            value = EvaluateFunction(funcName);
                        break;
                    case "Variable":
                        if (mapping.TryGetValue("From", out var varObj) && varObj is string varName &&
                            variables.TryGetValue(varName, out var varVal))
                            value = varVal;
                        break;
                    default:
                        if (mapping.TryGetValue("From", out var fromObj) && fromObj is string fromProp)
                            value = inputType?.GetProperty(fromProp)?.GetValue(inputEntity);
                        break;
                }
            }
            else if (mapping.TryGetValue("From", out var fromObj) && fromObj is string fromProp)
            {
                value = inputType?.GetProperty(fromProp)?.GetValue(inputEntity);
            }

            targetProp.SetValue(newEntity, value);
        }

        var db = dbContextService.GetDbContext();
        db.Add(newEntity);
        await db.SaveChangesAsync();
        return (TOutput)newEntity;
    }

    private static object? EvaluateFunction(string funcName)
    {
        return funcName switch
        {
            "UtcNow" => DateTime.UtcNow,
            "GuidNew" => Guid.NewGuid(),
            _ => null
        };
    }
}
