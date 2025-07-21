using TheBackend.DynamicModels;
using Microsoft.AspNetCore.Mvc;
using TheBackend.Api;

using Microsoft.Extensions.Logging;
namespace TheBackend.Api.Controllers
{
    [ApiController]
    [Route("api/models")]
    public class ModelsController : ControllerBase
    {
        private readonly ModelDefinitionService _modelService;
        private readonly DynamicDbContextService _dbContextService;  // See Step 4
        private readonly ILogger<ModelsController> _logger;

        public ModelsController(ModelDefinitionService modelService, DynamicDbContextService dbContextService, ILogger<ModelsController> logger)
        {
            _modelService = modelService;
            _dbContextService = dbContextService;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetModels()
        {
            _logger.LogInformation("List models");
            var models = _modelService.LoadModels();
            return Ok(models);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateModel([FromBody] ModelDefinition definition)
        {
            _logger.LogInformation("Create or update model {Name}", definition.ModelName);
            var models = _modelService.LoadModels();
            var existing = models.FirstOrDefault(m => m.ModelName == definition.ModelName);
            if (existing != null) models.Remove(existing);
            models.Add(definition);
            _modelService.SaveModels(models);

            // Regenerate DbContext, apply migration
            await _dbContextService.RegenerateAndMigrateAsync();

            return Ok(ApiResponse<string>.Ok($"Model {definition.ModelName} created/updated and migrated."));
        }
    }
}
