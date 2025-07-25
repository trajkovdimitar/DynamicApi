using Microsoft.AspNetCore.Mvc;
using TheBackend.DynamicModels.Workflows;

namespace TheBackend.Api.Controllers;

[ApiController]
[Route("api/workflows")]
public class WorkflowsController : ControllerBase
{
    private readonly WorkflowService _service;

    public WorkflowsController(WorkflowService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var wfs = _service.GetWorkflows();
        return Ok(ApiResponse<object>.Ok(wfs));
    }

    [HttpGet("{name}")]
    public IActionResult Get(string name)
    {
        var wf = _service.GetWorkflow(name);
        return wf == null
            ? NotFound(ApiResponse<object>.Fail("Not found"))
            : Ok(ApiResponse<object>.Ok(wf));
    }

    [HttpPost]
    public IActionResult Save([FromBody] WorkflowDefinition def)
    {
        _service.SaveWorkflow(def);
        return Ok(ApiResponse<object>.Ok(def));
    }

    [HttpPost("{name}/rollback/{version}")]
    public IActionResult Rollback(string name, int version)
    {
        var result = _service.RollbackWorkflow(name, version);
        return result
            ? Ok(ApiResponse<string>.Ok($"Rolled back to version {version}"))
            : NotFound(ApiResponse<string>.Fail("Version not found"));
    }
}
