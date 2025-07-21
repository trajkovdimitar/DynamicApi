using Microsoft.AspNetCore.Mvc;
using RulesEngine.Models;
using TheBackend.DynamicModels;
using TheBackend.Api;
using System.Threading.Tasks;

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
    public IActionResult GetAll() => Ok(ApiResponse<object>.Ok(_ruleService.GetWorkflows()));

    [HttpGet("{workflowName}")]
    public IActionResult Get(string workflowName)
    {
        var wf = _ruleService.GetWorkflows()
            .FirstOrDefault(w => w.WorkflowName.Equals(workflowName, StringComparison.OrdinalIgnoreCase));
        return wf == null
            ? NotFound(ApiResponse<object>.Fail("Workflow not found"))
            : Ok(ApiResponse<object>.Ok(wf!));
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrUpdate([FromBody] Workflow workflow)
    {
        await _ruleService.AddOrUpdateWorkflowAsync(workflow);
        return Ok(ApiResponse<string>.Ok("Workflow saved"));
    }
}
