using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Configuration;
using TheBackend.Api;
using TheBackend.Api.Controllers;
using TheBackend.DynamicModels;
using Xunit;

namespace TheBackend.Tests;

public class GenericControllerTests
{
    private static DynamicDbContextService CreateService()
    {
        var modelService = new ModelDefinitionService();
        var config = new ConfigurationBuilder().Build();
        var service = new DynamicDbContextService(modelService, config);
        typeof(DynamicDbContextService)
            .GetField("_dynamicAssembly", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(GenericControllerTests).Assembly);
        return service;
    }

    [Fact]
    public async Task GetAll_ReturnsNotFound_ForUnknownModel()
    {
        using var dbService = CreateService();
        var ruleService = new BusinessRuleService(Path.GetTempFileName());
        var controller = new GenericController(dbService, ruleService, NullLogger<GenericController>.Instance);

        var result = await controller.GetAll("UnknownModel");

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponse<object>>(notFound.Value);
        Assert.Equal("Model not found", response.Message);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_ForUnknownModel()
    {
        using var dbService = CreateService();
        var ruleService = new BusinessRuleService(Path.GetTempFileName());
        var controller = new GenericController(dbService, ruleService, NullLogger<GenericController>.Instance);

        var result = await controller.GetById("UnknownModel", "1");

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponse<object>>(notFound.Value);
        Assert.Equal("Model not found", response.Message);
    }
}
