using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace TheBackend.DynamicModels.Workflows;

public class UpdateEntityExecutor : IWorkflowStepExecutor
{
    private readonly ILogger<UpdateEntityExecutor> _logger;

    public UpdateEntityExecutor(ILogger<UpdateEntityExecutor> logger)
    {
        _logger = logger;
    }

    public string SupportedType => "UpdateEntity";

    public async Task<object?> ExecuteAsync(
        object? inputEntity,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables)
    {
        if (!step.Parameters.TryGetValue("ModelName", out var modelNameObj) || modelNameObj is not string modelName)
            throw new InvalidOperationException("Missing ModelName");

        if (!step.Parameters.TryGetValue("Id", out var idObj))
            throw new InvalidOperationException("Missing Id parameter");

        var modelType = dbContextService.GetModelType(modelName) ?? throw new InvalidOperationException($"Model not found: {modelName}");
        var db = dbContextService.GetDbContext();

        object? idValue = idObj;
        if (idObj is string idStr)
        {
            if (idStr.StartsWith("Input."))
            {
                var prop = inputEntity?.GetType().GetProperty(idStr.Substring(6));
                idValue = prop?.GetValue(inputEntity);
            }
            else if (idStr.StartsWith("Var."))
            {
                variables.TryGetValue(idStr.Substring(4), out var val);
                idValue = val;
            }
        }

        if (idValue == null)
            throw new InvalidOperationException("Id value could not be resolved");

        var entity = await db.FindAsync(modelType, idValue);
        if (entity == null)
            throw new KeyNotFoundException("Entity not found");

        var mappings = step.Parameters.TryGetValue("Mappings", out var mapObj) && mapObj is IEnumerable<object> list
            ? list.OfType<Dictionary<string, object>>()
            : Enumerable.Empty<Dictionary<string, object>>();

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
        return entity;
    }
}
