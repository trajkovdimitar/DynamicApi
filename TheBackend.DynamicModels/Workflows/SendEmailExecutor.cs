using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TheBackend.Application.Services;

namespace TheBackend.DynamicModels.Workflows;

public class SendEmailExecutor<TInput> : IWorkflowStepExecutor<TInput, bool>
{
    private readonly IEmailService _emailService;

    public SendEmailExecutor(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public string SupportedType => "SendEmail";

    public async Task<bool> ExecuteAsync(
        TInput? input,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables)
    {
        var to = step.GetParameterValue<string>("To") ?? throw new InvalidOperationException("To parameter missing");
        var subject = step.GetParameterValue<string>("Subject") ?? string.Empty;
        var body = step.GetParameterValue<string>("Body") ?? string.Empty;
        await _emailService.SendEmailAsync(to, subject, body);
        return true;
    }
}
