using Microsoft.AspNetCore.Mvc;
using RulesEngine.Models;
using TheBackend.DynamicModels;
using TheBackend.Api;
using Microsoft.Extensions.Logging;

namespace TheBackend.Api.Controllers;

[ApiController]
[Route("api/rules")]
public class RulesController : ControllerBase
{
    private readonly BusinessRuleService _ruleService;
    private readonly ILogger<RulesController> _logger;

    public RulesController(BusinessRuleService ruleService, ILogger<RulesController> logger)
    {
        _ruleService = ruleService;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        _logger.LogInformation("List workflows");
        return Ok(ApiResponse<object>.Ok(_ruleService.GetWorkflows()));
    }

    [HttpGet("{workflowName}")]
    public IActionResult Get(string workflowName)
    {
        _logger.LogInformation("Get workflow {Name}", workflowName);
        var wf = _ruleService.GetWorkflows()
            .FirstOrDefault(w => w.WorkflowName.Equals(workflowName, StringComparison.OrdinalIgnoreCase));
        return wf == null
            ? NotFound(ApiResponse<object>.Fail("Workflow not found"))
            : Ok(ApiResponse<object>.Ok(wf!));
    }

    [HttpPost]
    public IActionResult CreateOrUpdate([FromBody] Workflow workflow)
    {
        _logger.LogInformation("Save workflow {Name}", workflow.WorkflowName);
        _ruleService.AddOrUpdateWorkflow(workflow);
        return Ok(ApiResponse<string>.Ok("Workflow saved"));
    }
}
