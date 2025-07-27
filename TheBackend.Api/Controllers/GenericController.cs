using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RulesEngine.Models;
using System.Collections.Generic;
using System.Linq;
using TheBackend.Api;
using TheBackend.Application.Repositories;
using TheBackend.Domain.Models;
using TheBackend.DynamicModels;
using TheBackend.DynamicModels.Workflows;
using TheBackend.Infrastructure.Repositories;

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

            var definition = _dbContextService.GetModelDefinition(modelName);
            var jObj = JsonConvert.DeserializeObject<Newtonsoft.Json.Linq.JObject>(body) ?? new();
            var missing = definition?.Properties
                .Where(p => p.IsRequired && !p.IsKey && !jObj.ContainsKey(p.Name))
                .Select(p => new ValidationError { Field = p.Name, Error = "Field is required" })
                .ToList() ?? new List<ValidationError>();
            if (missing.Any()) return BadRequest(ApiResponse<object>.Fail("Validation failed", missing));

            // Validate FK relationships
            var fkErrors = new List<ValidationError>();
            foreach (var rel in definition?.Relationships ?? new List<RelationshipDefinition>())
            {
                if (rel.RelationshipType == "ManyToOne" || rel.RelationshipType == "OneToOne") // FKs on this side
                {
                    var fkName = rel.ForeignKey;
                    if (!string.IsNullOrEmpty(fkName) && jObj.ContainsKey(fkName))
                    {
                        var fkValueObj = jObj[fkName]?.ToObject<object>();
                        if (fkValueObj != null)
                        {
                            var targetModelType = _dbContextService.GetModelType(rel.TargetModel);
                            // Inside the FK validation loop in Post method
                            targetModelType = _dbContextService.GetModelType(rel.TargetModel);
                            if (targetModelType != null && jObj.ContainsKey(fkName))
                            {
                                fkValueObj = jObj[fkName]?.ToObject<object>();
                                if (fkValueObj != null)
                                {
                                    // Get target PK type
                                    var targetEntityType = dbContext.Model.FindEntityType(targetModelType);
                                    var targetKey = targetEntityType.FindPrimaryKey();
                                    if (targetKey == null || targetKey.Properties.Count != 1)
                                    {
                                        fkErrors.Add(new ValidationError { Field = fkName, Error = "Unsupported key in target model." });
                                        continue;
                                    }
                                    var keyType = targetKey.Properties[0].ClrType;

                                    // Convert to exact key type
                                    object convertedFkValue;
                                    try
                                    {
                                        convertedFkValue = Convert.ChangeType(fkValueObj, keyType);
                                    }
                                    catch (Exception ex)
                                    {
                                        fkErrors.Add(new ValidationError { Field = fkName, Error = $"Invalid FK type: {ex.Message}" });
                                        continue;
                                    }

                                    // Reflection for Set<T> and FindAsync
                                    var setMethod = typeof(DbContext)
                                        .GetMethod(nameof(DbContext.Set), Type.EmptyTypes)!
                                        .MakeGenericMethod(targetModelType);
                                    var entitySet = setMethod.Invoke(dbContext, null);

                                    var findMethod = entitySet.GetType()
                                        .GetMethod(nameof(DbSet<object>.FindAsync), new[] { typeof(object[]) })!;
                                    var findTask = (ValueTask)findMethod.Invoke(entitySet, new object[] { new[] { convertedFkValue } })!;

                                    await findTask.ConfigureAwait(false);

                                    var resultProperty = findTask.GetType().GetProperty("Result")!;
                                    var result = resultProperty.GetValue(findTask);

                                    var exists = result != null;
                                    if (!exists)
                                    {
                                        fkErrors.Add(new ValidationError { Field = fkName, Error = $"Referenced {rel.TargetModel} with ID {fkValueObj} does not exist." });
                                    }
                                }
                            }
                            else
                            {
                                fkErrors.Add(new ValidationError { Field = fkName, Error = $"Target model {rel.TargetModel} not found." });
                            }
                        }
                    }
                }
            }
            if (fkErrors.Any()) return BadRequest(ApiResponse<object>.Fail("Foreign key validation failed", fkErrors));

            var entity = jObj.ToObject(modelType)!;

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
            var task = (ValueTask)addMethod.Invoke(repo, new[] { entity });
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
