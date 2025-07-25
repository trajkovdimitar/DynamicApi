using System;
using System.Collections.Generic;

namespace TheBackend.DynamicModels.Workflows;

public class WorkflowStepExecutorRegistry
{
    private readonly Dictionary<string, IWorkflowStepExecutor> _executors = new(StringComparer.OrdinalIgnoreCase);

    public WorkflowStepExecutorRegistry(IEnumerable<IWorkflowStepExecutor> executors)
    {
        foreach (var executor in executors)
        {
            _executors[executor.SupportedType] = executor;
        }
    }

    public void Register(IWorkflowStepExecutor executor)
    {
        _executors[executor.SupportedType] = executor;
    }

    public IWorkflowStepExecutor? GetExecutor(string type)
    {
        _executors.TryGetValue(type, out var executor);
        return executor;
    }
}
