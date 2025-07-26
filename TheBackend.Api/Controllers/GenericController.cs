using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using TheBackend.Application.Repositories;
using TheBackend.DynamicModels;
using TheBackend.DynamicModels.Workflows;
using TheBackend.Infrastructure.Repositories;
using RulesEngine.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.OData.Query;
using System.Linq;
using TheBackend.Api;

namespace TheBackend.Api.Controllers
{
    // Controllers/GenericController.cs
    [ApiController]
    [Route("api/{modelName}")]
    public class GenericController : ControllerBase
    {
        private readonly DynamicDbContextService _dbContextService;
        private readonly BusinessRuleService _ruleService;
        private readonly WorkflowService _workflowService;
        private readonly ILogger<GenericController> _logger;

        public GenericController(DynamicDbContextService dbContextService, BusinessRuleService ruleService, WorkflowService workflowService, ILogger<GenericController> logger)
        {
            _dbContextService = dbContextService;
            _ruleService = ruleService;
            _workflowService = workflowService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(string modelName)
        {
            _logger.LogInformation("Get all {Model}", modelName);
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound(ApiResponse<object>.Fail("Model not found"));

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), _dbContextService.GetDbContext());

            var getAllMethod = repoType.GetMethod("GetAllAsync");
            var resultTask = (Task)getAllMethod.Invoke(repo, null);
            await resultTask.ConfigureAwait(false);

            var resultProperty = resultTask.GetType().GetProperty("Result");
            var result = resultProperty.GetValue(resultTask);

            return Ok(ApiResponse<object>.Ok(result!));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string modelName, string id)
        {
            _logger.LogInformation("Get {Model} with id {Id}", modelName, id);
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound(ApiResponse<object>.Fail("Model not found"));

            var dbContext = _dbContextService.GetDbContext();
            var entityType = dbContext.Model.FindEntityType(modelType);
            var key = entityType.FindPrimaryKey();
            if (key == null || key.Properties.Count != 1) return BadRequest(ApiResponse<object>.Fail("Unsupported key"));

            var keyType = key.Properties[0].ClrType;
            var convertedId = Convert.ChangeType(id, keyType);

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), dbContext);

            var getMethod = repoType.GetMethod("GetByIdAsync");
            var resultTask = (Task)getMethod.Invoke(repo, new[] { convertedId });
            await resultTask.ConfigureAwait(false);

            var result = resultTask.GetType().GetProperty("Result").GetValue(resultTask);
            if (result == null) return NotFound(ApiResponse<object>.Fail("Not found"));

            return Ok(ApiResponse<object>.Ok(result!));
        }

        [HttpPost]
        public async Task<IActionResult> Post(string modelName)
        {
            _logger.LogInformation("Create {Model}", modelName);
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound(ApiResponse<object>.Fail("Model not found"));

            var dbContext = _dbContextService.GetDbContext();

            string body;
            using (var reader = new StreamReader(Request.Body))
            {
                body = await reader.ReadToEndAsync();
            }

            var entity = JsonConvert.DeserializeObject(body, modelType)!;

            var workflowName = $"{modelName}.Create";
            if (_ruleService.HasWorkflow(workflowName))
            {
                var results = await _ruleService.ExecuteAsync(workflowName, new RuleParameter("entity", entity));
                var failures = results
                    .Where(r => !r.IsSuccess)
                    .Select(r => new ValidationError
                    {
                        Field = r.Rule.RuleName,
                        Error = r.ExceptionMessage ?? r.Rule.ErrorMessage
                    })
                    .ToList();
                if (failures.Any()) return BadRequest(ApiResponse<object>.Fail("Business rule validation failed", failures));
            }

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), dbContext);

            var addMethod = repoType.GetMethod("AddAsync");
            var task = (Task)addMethod.Invoke(repo, new[] { entity });
            await task.ConfigureAwait(false);

            await _workflowService.RunAsync(
                $"{modelName}.AfterCreate",
                _dbContextService,
                entity,
                HttpContext.RequestServices);

            return Ok(ApiResponse<object>.Ok(entity));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string modelName, string id)
        {
            _logger.LogInformation("Update {Model} with id {Id}", modelName, id);
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound(ApiResponse<object>.Fail("Model not found"));

            var dbContext = _dbContextService.GetDbContext();
            var entityType = dbContext.Model.FindEntityType(modelType);
            var key = entityType.FindPrimaryKey();
            if (key == null || key.Properties.Count != 1) return BadRequest(ApiResponse<object>.Fail("Unsupported key"));

            var keyType = key.Properties[0].ClrType;
            var keyPropertyInfo = key.Properties[0].PropertyInfo;
            var convertedId = Convert.ChangeType(id, keyType);

            string body;
            using (var reader = new StreamReader(Request.Body))
            {
                body = await reader.ReadToEndAsync();
            }

            var entity = JsonConvert.DeserializeObject(body, modelType)!;

            object entityId = keyPropertyInfo.GetValue(entity);
            if (!Equals(entityId, convertedId)) return BadRequest(ApiResponse<object>.Fail("Id mismatch"));

            var workflowName = $"{modelName}.Update";
            if (_ruleService.HasWorkflow(workflowName))
            {
                var results = await _ruleService.ExecuteAsync(workflowName, new RuleParameter("entity", entity));
                var failures = results
                    .Where(r => !r.IsSuccess)
                    .Select(r => new ValidationError
                    {
                        Field = r.Rule.RuleName,
                        Error = r.ExceptionMessage ?? r.Rule.ErrorMessage
                    })
                    .ToList();
                if (failures.Any()) return BadRequest(ApiResponse<object>.Fail("Business rule validation failed", failures));
            }

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), dbContext);

            var updateMethod = repoType.GetMethod("UpdateAsync");
            var task = (Task)updateMethod.Invoke(repo, new[] { entity });
            await task.ConfigureAwait(false);

            await _workflowService.RunAsync(
                $"{modelName}.AfterUpdate",
                _dbContextService,
                entity,
                HttpContext.RequestServices);

            return Ok(ApiResponse<object>.Ok(entity));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string modelName, string id)
        {
            _logger.LogInformation("Delete {Model} with id {Id}", modelName, id);
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound(ApiResponse<object>.Fail("Model not found"));

            var dbContext = _dbContextService.GetDbContext();
            var entityType = dbContext.Model.FindEntityType(modelType);
            var key = entityType.FindPrimaryKey();
            if (key == null || key.Properties.Count != 1) return BadRequest(ApiResponse<object>.Fail("Unsupported key"));

            var keyType = key.Properties[0].ClrType;
            var convertedId = Convert.ChangeType(id, keyType);

            var workflowName = $"{modelName}.Delete";
            if (_ruleService.HasWorkflow(workflowName))
            {
                var results = await _ruleService.ExecuteAsync(workflowName, new RuleParameter("id", convertedId));
                var failures = results
                    .Where(r => !r.IsSuccess)
                    .Select(r => new ValidationError
                    {
                        Field = r.Rule.RuleName,
                        Error = r.ExceptionMessage ?? r.Rule.ErrorMessage
                    })
                    .ToList();
                if (failures.Any()) return BadRequest(ApiResponse<object>.Fail("Business rule validation failed", failures));
            }

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), dbContext);

            var deleteMethod = repoType.GetMethod("DeleteAsync");
            var task = (Task)deleteMethod.Invoke(repo, new[] { convertedId });
            await task.ConfigureAwait(false);

            await _workflowService.RunAsync(
                $"{modelName}.AfterDelete",
                _dbContextService,
                convertedId,
                HttpContext.RequestServices);

            return Ok(ApiResponse<object>.Ok(null!, "Deleted"));
        }
    }
}
