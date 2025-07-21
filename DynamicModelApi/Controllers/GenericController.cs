using DynamicData;
using Microsoft.AspNetCore.Mvc;

namespace DynamicModelApi.Controllers
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
        // Add endpoints for GetById, Post, Put, Delete using reflection
    }
}
