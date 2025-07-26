using System;
using System.Threading;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Elsa.Workflows;
using Elsa.Workflows.Management;
using Elsa.Workflows.Options;
using Elsa.Common.Models;
using Newtonsoft.Json;

namespace TheBackend.DynamicModels.Workflows;

public class ElsaWorkflowExecutor : IWorkflowStepExecutor
{
    public string SupportedType => "ElsaWorkflow";

    public async Task<object?> ExecuteAsync(
        object? inputEntity,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables)
    {
        var runner = serviceProvider.GetRequiredService<IWorkflowRunner>();
        var defService = serviceProvider.GetRequiredService<IWorkflowDefinitionService>();

        Elsa.Workflows.Management.Entities.WorkflowDefinition? definition = null;

        if (step.Parameters.TryGetValue("Definition", out var jsonObj) && jsonObj is string json)
        {
            definition = JsonConvert.DeserializeObject<Elsa.Workflows.Management.Entities.WorkflowDefinition>(json);
        }
        else if (step.Parameters.TryGetValue("DefinitionId", out var idObj) && idObj is string defId)
        {
            definition = await defService.FindWorkflowDefinitionAsync(defId, VersionOptions.Published, CancellationToken.None);
        }

        if (definition == null)
            throw new InvalidOperationException("Workflow definition not provided.");

        var workflow = await defService.MaterializeWorkflowAsync(definition, CancellationToken.None);
        var options = new RunWorkflowOptions
        {
            Input = new Dictionary<string, object?> { ["Input"] = inputEntity }
        };
        await runner.RunAsync(workflow, options, CancellationToken.None);
        return inputEntity;
    }
}
