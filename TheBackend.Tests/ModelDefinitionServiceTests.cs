using TheBackend.DynamicModels;
using Xunit;

using System.Threading.Tasks;
namespace TheBackend.Tests;

public class ModelDefinitionServiceTests
{
    [Fact]
    public async Task SaveAndLoadModels()
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
                new ModelDefinition
                {
                    ModelName = "Sample",
                    Properties = new List<PropertyDefinition>()
                }
            };
            await service.SaveModelsAsync(models);
            var loaded = await service.LoadModelsAsync();
            Assert.Single(loaded);
            Assert.Equal("Sample", loaded[0].ModelName);
        }
        finally
        {
            Directory.SetCurrentDirectory(originalDir);
            Directory.Delete(tempDir, true);
        }
    }
}