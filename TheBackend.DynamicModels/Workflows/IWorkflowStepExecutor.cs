using System;
using System.Threading.Tasks;

namespace TheBackend.DynamicModels.Workflows;

public interface IWorkflowStepExecutor
{
    string SupportedType { get; }
}

public interface IWorkflowStepExecutor<TInput, TOutput> : IWorkflowStepExecutor
{
    Task<TOutput?> ExecuteAsync(
        TInput? input,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables);
}
