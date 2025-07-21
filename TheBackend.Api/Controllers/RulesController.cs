using Microsoft.AspNetCore.Mvc;
using RulesEngine.Models;
using TheBackend.DynamicModels;

namespace TheBackend.Api.Controllers;

[ApiController]
[Route("api/rules")]
public class RulesController : ControllerBase
{
    private readonly BusinessRuleService _ruleService;

    public RulesController(BusinessRuleService ruleService)
    {
        _ruleService = ruleService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_ruleService.GetWorkflows());

    [HttpGet("{workflowName}")]
    public IActionResult Get(string workflowName)
    {
        var wf = _ruleService.GetWorkflows()
            .FirstOrDefault(w => w.WorkflowName.Equals(workflowName, StringComparison.OrdinalIgnoreCase));
        return wf == null ? NotFound() : Ok(wf);
    }

    [HttpPost]
    public IActionResult CreateOrUpdate([FromBody] Workflow workflow)
    {
        _ruleService.AddOrUpdateWorkflow(workflow);
        return Ok();
    }
}
