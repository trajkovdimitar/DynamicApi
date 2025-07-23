using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
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
        private readonly ModelHistoryService _historyService;
        private readonly ILogger<ModelsController> _logger;

        public ModelsController(ModelDefinitionService modelService, DynamicDbContextService dbContextService, ModelHistoryService historyService, ILogger<ModelsController> logger)
        {
            _modelService = modelService;
            _dbContextService = dbContextService;
            _historyService = historyService;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetModels()
        {
            _logger.LogInformation("List models");
            var models = _modelService.LoadModels();
            return Ok(ApiResponse<List<ModelDefinition>>.Ok(models));
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
            var hash = _modelService.ComputeModelsHash();
            var action = existing == null ? "Created" : "Updated";
            _historyService.RecordModelChange(definition, action, hash);

            return Ok(ApiResponse<string>.Ok($"Model {definition.ModelName} created/updated and migrated."));
        }
    }
}
