using TheBackend.Domain.Models;
using TheBackend.DynamicModels;
using Xunit;

namespace TheBackend.Tests;

public class ModelDefinitionServiceTests
{
    [Fact]
    public void SaveAndLoadModels()
    {
        var tempDir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
        Directory.CreateDirectory(tempDir);
        var modelsPath = Path.Combine(tempDir, "models.json");

        try
        {
            var service = new ModelDefinitionService(modelsPath);
            var models = new List<ModelDefinition>
        {
            new ModelDefinition
            {
                ModelName = "Sample",
                Properties = new List<PropertyDefinition>()
            }
        };
            service.SaveModels(models);
            var loaded = service.LoadModels();
            Assert.Single(loaded);
            Assert.Equal("Sample", loaded[0].ModelName);
        }
        finally
        {
            Directory.Delete(tempDir, recursive: true);
        }
    }

}