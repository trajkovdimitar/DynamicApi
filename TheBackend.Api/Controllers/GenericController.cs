using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using TheBackend.Application.Repositories;
using TheBackend.DynamicModels;
using TheBackend.Infrastructure.Repositories;

namespace TheBackend.Api.Controllers
{
    // Controllers/GenericController.cs
    [ApiController]
    [Route("api/{modelName}")]
    public class GenericController : ControllerBase
    {
        private readonly DynamicDbContextService _dbContextService;

        public GenericController(DynamicDbContextService dbContextService)
        {
            _dbContextService = dbContextService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(string modelName)
        {
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound();

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), _dbContextService.GetDbContext());

            var getAllMethod = repoType.GetMethod("GetAllAsync");
            var resultTask = (Task)getAllMethod.Invoke(repo, null);
            await resultTask.ConfigureAwait(false);

            var resultProperty = resultTask.GetType().GetProperty("Result");
            var result = resultProperty.GetValue(resultTask);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string modelName, string id)
        {
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound();

            var dbContext = _dbContextService.GetDbContext();
            var entityType = dbContext.Model.FindEntityType(modelType);
            var key = entityType.FindPrimaryKey();
            if (key == null || key.Properties.Count != 1) return BadRequest("Unsupported key");

            var keyType = key.Properties[0].ClrType;
            object convertedId;
            try
            {
                convertedId = Convert.ChangeType(id, keyType);
            }
            catch
            {
                return BadRequest("Invalid id");
            }

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), dbContext);

            var getMethod = repoType.GetMethod("GetByIdAsync");
            var resultTask = (Task)getMethod.Invoke(repo, new[] { convertedId });
            await resultTask.ConfigureAwait(false);

            var result = resultTask.GetType().GetProperty("Result").GetValue(resultTask);
            if (result == null) return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post(string modelName)
        {
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound();

            var dbContext = _dbContextService.GetDbContext();

            string body;
            using (var reader = new StreamReader(Request.Body))
            {
                body = await reader.ReadToEndAsync();
            }

            object entity;
            try
            {
                entity = JsonConvert.DeserializeObject(body, modelType);
            }
            catch
            {
                return BadRequest("Invalid body");
            }

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), dbContext);

            var addMethod = repoType.GetMethod("AddAsync");
            var task = (Task)addMethod.Invoke(repo, new[] { entity });
            await task.ConfigureAwait(false);

            return Ok(entity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string modelName, string id)
        {
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound();

            var dbContext = _dbContextService.GetDbContext();
            var entityType = dbContext.Model.FindEntityType(modelType);
            var key = entityType.FindPrimaryKey();
            if (key == null || key.Properties.Count != 1) return BadRequest("Unsupported key");

            var keyType = key.Properties[0].ClrType;
            var keyPropertyInfo = key.Properties[0].PropertyInfo;
            object convertedId;
            try
            {
                convertedId = Convert.ChangeType(id, keyType);
            }
            catch
            {
                return BadRequest("Invalid id");
            }

            string body;
            using (var reader = new StreamReader(Request.Body))
            {
                body = await reader.ReadToEndAsync();
            }

            object entity;
            try
            {
                entity = JsonConvert.DeserializeObject(body, modelType);
            }
            catch
            {
                return BadRequest("Invalid body");
            }

            object entityId = keyPropertyInfo.GetValue(entity);
            if (!Equals(entityId, convertedId)) return BadRequest("Id mismatch");

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), dbContext);

            var updateMethod = repoType.GetMethod("UpdateAsync");
            var task = (Task)updateMethod.Invoke(repo, new[] { entity });
            await task.ConfigureAwait(false);

            return Ok(entity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string modelName, string id)
        {
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound();

            var dbContext = _dbContextService.GetDbContext();
            var entityType = dbContext.Model.FindEntityType(modelType);
            var key = entityType.FindPrimaryKey();
            if (key == null || key.Properties.Count != 1) return BadRequest("Unsupported key");

            var keyType = key.Properties[0].ClrType;
            object convertedId;
            try
            {
                convertedId = Convert.ChangeType(id, keyType);
            }
            catch
            {
                return BadRequest("Invalid id");
            }

            var repoType = typeof(IGenericRepository<>).MakeGenericType(modelType);
            var repo = Activator.CreateInstance(typeof(GenericRepository<>).MakeGenericType(modelType), dbContext);

            var deleteMethod = repoType.GetMethod("DeleteAsync");
            var task = (Task)deleteMethod.Invoke(repo, new[] { convertedId });
            await task.ConfigureAwait(false);

            return NoContent();
        }
    }
}
