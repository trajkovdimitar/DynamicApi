using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using TheBackend.Api;
using TheBackend.Api.Controllers;
using TheBackend.Domain.Models;
using TheBackend.DynamicModels;
using Xunit;

namespace TheBackend.Tests;

public class ModelsControllerTests
{
    [Fact]
    public void GetModels_ReturnsWrappedResponse()
    {
        var originalDir = Directory.GetCurrentDirectory();
        var tempDir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
        Directory.CreateDirectory(tempDir);
        Directory.SetCurrentDirectory(tempDir);
        try
        {
            var service = new ModelDefinitionService();
            var models = new List<ModelDefinition>
            {
                new ModelDefinition { ModelName = "Sample", Properties = new List<PropertyDefinition>() }
            };
            service.SaveModels(models);

            var config = new ConfigurationBuilder().Build();
            using var dbService = new DynamicDbContextService(service, config);
            var controller = new ModelsController(service, dbService, NullLogger<ModelsController>.Instance);

            var result = controller.GetModels();

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<ModelDefinition>>>(ok.Value);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Single(response.Data!);
            Assert.Equal("Sample", response.Data![0].ModelName);
        }
        finally
        {
            Directory.SetCurrentDirectory(originalDir);
            Directory.Delete(tempDir, true);
        }
    }
}
