using System;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;

namespace TheBackend.DynamicModels.Workflows;

public class WorkflowStepExecutorRegistry
{
    private readonly Dictionary<string, Type> _executorTypes = new(StringComparer.OrdinalIgnoreCase);
    private readonly IServiceProvider _provider;

    public WorkflowStepExecutorRegistry(IEnumerable<IWorkflowStepExecutor> executors, IServiceProvider provider)
    {
        _provider = provider;
        foreach (var executor in executors)
        {
            _executorTypes[executor.SupportedType] = executor.GetType();
        }
    }

    public void Register(IWorkflowStepExecutor executor)
    {
        _executorTypes[executor.SupportedType] = executor.GetType();
    }

    public IWorkflowStepExecutor? GetExecutor(string type)
    {
        if (!_executorTypes.TryGetValue(type, out var executorType))
            return null;
        return (IWorkflowStepExecutor)_provider.GetRequiredService(executorType);
    }
}
