using TheBackend.DynamicModels;
using TheBackend.Domain.Models;
using Microsoft.AspNetCore.Mvc;
using TheBackend.Api;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;  // Add if not already present
using System.Linq;  // Add if not already present

namespace TheBackend.Api.Controllers
{
    [ApiController]
    [Route("api/models")]
    public class ModelsController : ControllerBase
    {
        private readonly ModelDefinitionService _modelService;
        private readonly DynamicDbContextService _dbContextService;
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
            try
            {
                _logger.LogInformation("Create or update model {Name}", definition.ModelName);
                var models = _modelService.LoadModels();
                var existing = models.FirstOrDefault(m => m.ModelName == definition.ModelName);
                if (existing != null) models.Remove(existing);
                models.Add(definition);

                // New: Validate relationships before proceeding
                ValidateModelRelationships(models);

                _modelService.SaveModels(models);

                // Regenerate DbContext, apply migration
                await _dbContextService.RegenerateAndMigrateAsync();
                var hash = _modelService.ComputeModelsHash();
                var action = existing == null ? "Created" : "Updated";
                _historyService.RecordModelChange(definition, action, hash);

                return Ok(ApiResponse<string>.Ok($"Model {definition.ModelName} created/updated and migrated."));
            }
            catch (InvalidOperationException ex)
            {
                // Graceful handling: Return 400 with specific message
                _logger.LogWarning(ex, "Model validation failed");
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                // Fallback for other errors (e.g., compilation failures if validation misses something)
                _logger.LogError(ex, "Unexpected error during model creation/update");
                return StatusCode(500, ApiResponse<string>.Fail("An unexpected error occurred while processing the model."));
            }
        }

        // New validation method
        private void ValidateModelRelationships(List<ModelDefinition> models)
        {
            var modelNames = models.Select(m => m.ModelName).ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var model in models)
            {
                if (model.IgnoreMissingRelationships)
                {
                    _logger.LogInformation("Skipping relationship validation for model {Model}", model.ModelName);
                    continue;
                }

                foreach (var rel in model.Relationships)
                {
                    if (!modelNames.Contains(rel.TargetModel))
                    {
                        throw new InvalidOperationException(
                            $"Invalid relationship in model '{model.ModelName}': Referenced target model '{rel.TargetModel}' does not exist. Create '{rel.TargetModel}' first or remove the reference.");
                    }
                }
            }
        }
    }
}