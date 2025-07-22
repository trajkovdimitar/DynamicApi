using TheBackend.Application.Events;
using RulesEngine.Models;

namespace TheBackend.DynamicModels;

public class WorkflowEventHandler :
    IEventHandler<ModelCreatedEvent>,
    IEventHandler<ModelUpdatedEvent>,
    IEventHandler<ModelDeletedEvent>
{
    private readonly BusinessRuleService _ruleService;

    public WorkflowEventHandler(BusinessRuleService ruleService)
    {
        _ruleService = ruleService;
    }

    public async Task HandleAsync(ModelCreatedEvent @event)
    {
        var name = $"{@event.ModelName}.Created";
        if (_ruleService.HasWorkflow(name))
        {
            await _ruleService.ExecuteAsync(name, new RuleParameter("entity", @event.Entity));
        }
    }

    public async Task HandleAsync(ModelUpdatedEvent @event)
    {
        var name = $"{@event.ModelName}.Updated";
        if (_ruleService.HasWorkflow(name))
        {
            await _ruleService.ExecuteAsync(name, new RuleParameter("entity", @event.Entity));
        }
    }

    public async Task HandleAsync(ModelDeletedEvent @event)
    {
        var name = $"{@event.ModelName}.Deleted";
        if (_ruleService.HasWorkflow(name))
        {
            await _ruleService.ExecuteAsync(name, new RuleParameter("id", @event.Id));
        }
    }
}
