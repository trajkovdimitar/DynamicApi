using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace TheBackend.DynamicModels.Workflows;

public class LogEventExecutor<TInput> : IWorkflowStepExecutor<TInput, bool>
{
    private readonly ILogger<LogEventExecutor<TInput>> _logger;

    public LogEventExecutor(ILogger<LogEventExecutor<TInput>> logger)
    {
        _logger = logger;
    }

    public string SupportedType => "LogEvent";

    public Task<bool> ExecuteAsync(
        TInput? input,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables)
    {
        var message = step.GetParameterValue<string>("Message") ?? string.Empty;
        _logger.LogInformation("Workflow LogEvent: {Message}", message);
        return Task.FromResult(true);
    }
}

