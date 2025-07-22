using System.Collections.Generic;
using TheBackend.Domain.Models;

namespace TheBackend.Admin.Services;

public class DynamicCollection
{
    public string ModelName { get; set; } = string.Empty;
    public List<PropertyDefinition> Properties { get; set; } = new();
}
