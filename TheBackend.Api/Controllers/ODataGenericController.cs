using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;
using TheBackend.DynamicModels;

namespace TheBackend.Api.Controllers
{
    [ApiController]
    [Route("odata/{modelName}")]
    public class ODataGenericController : ODataController
    {
        private readonly DynamicDbContextService _dbContextService;
        private readonly ILogger<ODataGenericController> _logger;

        public ODataGenericController(DynamicDbContextService dbContextService, ILogger<ODataGenericController> logger)
        {
            _dbContextService = dbContextService;
            _logger = logger;
        }

        [HttpGet]
        [EnableQuery]
        public IActionResult Get(string modelName)
        {
            _logger.LogInformation("OData get all {Model}", modelName);
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound();
            var dbContext = _dbContextService.GetDbContext();
            var set = (IQueryable)dbContext.GetType().GetMethod("Set", new[] { typeof(Type) })!
                .Invoke(dbContext, new object[] { modelType })!;
            return Ok(set);
        }

        [HttpGet("{id}")]
        [EnableQuery]
        public async Task<IActionResult> GetById(string modelName, string id)
        {
            _logger.LogInformation("OData get {Model} with id {Id}", modelName, id);
            var modelType = _dbContextService.GetModelType(modelName);
            if (modelType == null) return NotFound();
            var dbContext = _dbContextService.GetDbContext();
            var entityType = dbContext.Model.FindEntityType(modelType);
            var key = entityType?.FindPrimaryKey();
            if (key == null || key.Properties.Count != 1) return BadRequest();
            var keyType = key.Properties[0].ClrType;
            var convertedId = Convert.ChangeType(id, keyType);
            var entity = await dbContext.FindAsync(modelType, new[] { convertedId });
            if (entity == null) return NotFound();
            return Ok(entity);
        }
    }
}
