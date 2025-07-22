using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TheBackend.Domain.Models;

namespace TheBackend.Admin.Services;

public class CollectionService
{
    private readonly List<DynamicCollection> _collections = new()
    {
        new DynamicCollection
        {
            ModelName = "Articles",
            Properties = new List<PropertyDefinition>
            {
                new PropertyDefinition { Name = "Id", Type = "number", IsKey = true },
                new PropertyDefinition { Name = "Title", Type = "string", IsRequired = true },
                new PropertyDefinition { Name = "Content", Type = "string" }
            }
        },
        new DynamicCollection
        {
            ModelName = "Categories",
            Properties = new List<PropertyDefinition>
            {
                new PropertyDefinition { Name = "Id", Type = "number", IsKey = true },
                new PropertyDefinition { Name = "Name", Type = "string", IsRequired = true }
            }
        }
    };

    public Task<List<DynamicCollection>> GetCollectionsAsync() => Task.FromResult(_collections);

    public Task<DynamicCollection?> GetCollectionAsync(string name)
    {
        var coll = _collections.FirstOrDefault(c => c.ModelName.Equals(name, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(coll);
    }

    public Task<List<Dictionary<string, object>>> GetRecordsAsync(string name)
    {
        var list = new List<Dictionary<string, object>>();
        if (name.Equals("Articles", StringComparison.OrdinalIgnoreCase))
        {
            list.Add(new Dictionary<string, object>
            {
                ["Id"] = 1,
                ["Title"] = "First article",
                ["Content"] = "Hello world"
            });
        }

        return Task.FromResult(list);
    }
}
