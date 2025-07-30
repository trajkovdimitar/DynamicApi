using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace TheBackend.DynamicModels.Workflows;

public class UpdateEntityExecutor<TInput, TOutput> : IWorkflowStepExecutor<TInput, TOutput>
    where TOutput : class
{
    private readonly ILogger<UpdateEntityExecutor<TInput, TOutput>> _logger;

    public UpdateEntityExecutor(ILogger<UpdateEntityExecutor<TInput, TOutput>> logger)
    {
        _logger = logger;
    }

    public string SupportedType => "UpdateEntity";

    public async Task<TOutput?> ExecuteAsync(
        TInput? inputEntity,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables)
    {
        var paramDict = step.Parameters.ToDictionary(p => p.Key, p => p.GetTypedValue());

        if (!paramDict.TryGetValue("ModelName", out var modelNameObj) || modelNameObj is not string modelName)
            throw new InvalidOperationException("Missing ModelName");

        if (!paramDict.TryGetValue("Id", out var idObj))
            throw new InvalidOperationException("Missing Id parameter");

        var modelType = dbContextService.GetModelType(modelName)
            ?? throw new InvalidOperationException($"Model not found: {modelName}");
        var db = dbContextService.GetDbContext();

        var entityTypeModel = db.Model.FindEntityType(modelType);
        var pk = entityTypeModel?.FindPrimaryKey()?.Properties.FirstOrDefault()
                 ?? throw new InvalidOperationException("Unable to determine key type");

        object? idValue = idObj is string s ? step.GetResolvedString("Id", inputEntity, variables) ?? s : idObj;

        if (idValue == null)
            throw new InvalidOperationException("Id value could not be resolved");

        if (!pk.ClrType.IsAssignableFrom(idValue.GetType()))
            idValue = Convert.ChangeType(idValue, pk.ClrType);

        var entity = await db.FindAsync(modelType, idValue);
        if (entity == null)
            throw new KeyNotFoundException("Entity not found");

        IEnumerable<Dictionary<string, object>> mappings = Enumerable.Empty<Dictionary<string, object>>();
        if (paramDict.TryGetValue("Mappings", out var mapObj))
        {
            if (mapObj is IEnumerable<object> list)
            {
                mappings = list.OfType<Dictionary<string, object>>();
            }
            else if (mapObj is System.Text.Json.JsonElement elem && elem.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                mappings = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(elem.GetRawText()) ?? new();
            }
            else if (mapObj is string str)
            {
                mappings = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(str) ?? new();
            }
        }

        var entityType = entity.GetType();
        var inputType = inputEntity?.GetType();
        foreach (var mapping in mappings)
        {
            if (!mapping.TryGetValue("To", out var toObj) || toObj is not string toPropName)
                continue;

            var propInfo = entityType.GetProperty(toPropName);
            if (propInfo == null) continue;

            object? value = null;
            if (mapping.TryGetValue("SourceType", out var stObj) && stObj is string st)
            {
                switch (st)
                {
                    case "Constant":
                        if (mapping.TryGetValue("Value", out var constVal))
                            value = constVal;
                        break;
                    case "Variable":
                        if (mapping.TryGetValue("From", out var varObj) && varObj is string varName && variables.TryGetValue(varName, out var varVal))
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

            propInfo.SetValue(entity, value);
        }

        db.Update(entity);
        await db.SaveChangesAsync();
        _logger.LogInformation("Updated {Model} with id {Id}", modelName, idValue);
        return (TOutput)entity;
    }
}
