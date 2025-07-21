using TheBackend.DynamicModels;
using Microsoft.AspNetCore.Mvc;

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
        public IActionResult GetModels()
        {
            var models = _modelService.LoadModels();
            return Ok(models);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateModel([FromBody] ModelDefinition definition)
        {
            var models = _modelService.LoadModels();
            var existing = models.FirstOrDefault(m => m.ModelName == definition.ModelName);
            if (existing != null) models.Remove(existing);
            models.Add(definition);
            _modelService.SaveModels(models);

            // Regenerate DbContext, apply migration
            await _dbContextService.RegenerateAndMigrateAsync();

            return Ok($"Model {definition.ModelName} created/updated and migrated.");
        }
    }
}
