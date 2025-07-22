using HotChocolate;
using HotChocolate.Types;
using TheBackend.DynamicModels;
using TheBackend.Application.Repositories;
using TheBackend.Infrastructure.Repositories;
using TheBackend.Domain.Models;
using System.Collections;

namespace TheBackend.Api.GraphQL;

public class DynamicQuery
{
    public IEnumerable<ModelDefinition> GetModelDefinitions([Service] ModelDefinitionService service)
    {
        return service.LoadModels();
    }

    public async Task<IEnumerable<Dictionary<string, object?>>> GetEntities(
        string modelName,
        [Service] DynamicDbContextService dbService)
    {
        var modelType = dbService.GetModelType(modelName);
        var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
        var repo = Activator.CreateInstance(
            typeof(GenericRepository<>).MakeGenericType(modelType),
            dbService.GetDbContext());
        var getAllMethod = repoType.GetMethod("GetAllAsync")!;
        var resultTask = (Task)getAllMethod.Invoke(repo, null)!;
        await resultTask.ConfigureAwait(false);
        var result = (IEnumerable)resultTask.GetType().GetProperty("Result")!.GetValue(resultTask)!;
        var list = new List<Dictionary<string, object?>>();
        foreach (var item in result)
        {
            var dict = new Dictionary<string, object?>();
            foreach (var prop in item.GetType().GetProperties())
            {
                dict[prop.Name] = prop.GetValue(item);
            }
            list.Add(dict);
        }
        return list;
    }
}
