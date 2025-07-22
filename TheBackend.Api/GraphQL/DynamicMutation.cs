using HotChocolate;
using HotChocolate.Types;
using TheBackend.DynamicModels;
using TheBackend.Application.Repositories;
using TheBackend.Infrastructure.Repositories;
using RulesEngine.Models;
using System.Collections;

namespace TheBackend.Api.GraphQL;

public class DynamicMutation
{
    public async Task<Dictionary<string, object?>> AddEntity(
        string modelName,
        Dictionary<string, object?> input,
        [Service] DynamicDbContextService dbService,
        [Service] BusinessRuleService ruleService)
    {
        var modelType = dbService.GetModelType(modelName);
        var entity = Activator.CreateInstance(modelType)!;
        foreach (var prop in modelType.GetProperties())
        {
            if (input.TryGetValue(prop.Name, out var value) && value != null)
            {
                prop.SetValue(entity, Convert.ChangeType(value, prop.PropertyType));
            }
        }
        var workflowName = $"{modelName}.Create";
        if (ruleService.HasWorkflow(workflowName))
        {
            var results = await ruleService.ExecuteAsync(
                workflowName,
                new RuleParameter("entity", entity));
            if (results.Any(r => !r.IsSuccess))
            {
                throw new Exception("Business rule validation failed");
            }
        }
        var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
        var repo = Activator.CreateInstance(
            typeof(GenericRepository<>).MakeGenericType(modelType),
            dbService.GetDbContext());
        var addMethod = repoType.GetMethod("AddAsync")!;
        var task = (Task)addMethod.Invoke(repo, new[] { entity })!;
        await task.ConfigureAwait(false);
        var dict = new Dictionary<string, object?>();
        foreach (var prop in modelType.GetProperties())
        {
            dict[prop.Name] = prop.GetValue(entity);
        }
        return dict;
    }
}
