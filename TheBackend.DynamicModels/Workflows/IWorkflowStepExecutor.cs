using System;
using System.Threading.Tasks;

namespace TheBackend.DynamicModels.Workflows;

public interface IWorkflowStepExecutor
{
    string SupportedType { get; }

    Task<object?> ExecuteAsync(
        object? inputEntity,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables);
}
