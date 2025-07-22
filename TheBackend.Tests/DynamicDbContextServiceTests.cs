using Microsoft.Extensions.Configuration;
using TheBackend.DynamicModels;
using Xunit;

namespace TheBackend.Tests;

public class DynamicDbContextServiceTests
{
    [Fact]
    public void GetModelType_ReturnsNull_ForUnknownModel()
    {
        var modelService = new ModelDefinitionService();
        var config = new ConfigurationBuilder().Build();
        var service = new DynamicDbContextService(modelService, config);
        typeof(DynamicDbContextService)
            .GetField("_dynamicAssembly", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(DynamicDbContextServiceTests).Assembly);

        var type = service.GetModelType("UnknownModel");

        Assert.Null(type);
    }
}
