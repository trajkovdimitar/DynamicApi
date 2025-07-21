using TheBackend.DynamicModels;
using Microsoft.AspNetCore.Mvc;
using TheBackend.Api;
using System.Threading.Tasks;

namespace TheBackend.Api.Controllers
{
    [ApiController]
    [Route("api/models")]
    public class ModelsController : ControllerBase
    {
        private readonly ModelDefinitionService _modelService;
        private readonly DynamicDbContextService _dbContextService;  // See Step 4

        public ModelsController(ModelDefinitionService modelService, DynamicDbContextService dbContextService)
        {
            _modelService = modelService;
            _dbContextService = dbContextService;
        }

        [HttpGet]
        public async Task<IActionResult> GetModels()
        {
            var models = await _modelService.LoadModelsAsync();
            return Ok(models);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateModel([FromBody] ModelDefinition definition)
        {
            var models = await _modelService.LoadModelsAsync();
            var existing = models.FirstOrDefault(m => m.ModelName == definition.ModelName);
            if (existing != null) models.Remove(existing);
            models.Add(definition);
            await _modelService.SaveModelsAsync(models);

            // Regenerate DbContext, apply migration
            await _dbContextService.RegenerateAndMigrateAsync();

            return Ok(ApiResponse<string>.Ok($"Model {definition.ModelName} created/updated and migrated."));
        }
    }
}
