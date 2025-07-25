using Microsoft.Extensions.Configuration;
using TheBackend.DynamicModels.Workflows;
using Xunit;
using System;
using System.Collections.Generic;

namespace TheBackend.Tests;

public class WorkflowHistoryServiceTests
{
    [Fact]
    public void SaveWorkflow_IncrementsVersion()
    {
        var config = new ConfigurationBuilder().Build();
        var service = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var wf = new WorkflowDefinition { WorkflowName = "Test", Steps = new() };
        var version1 = service.SaveDefinition(wf);
        Assert.Equal(1, version1);
        var version2 = service.SaveDefinition(wf);
        Assert.Equal(2, version2);
        var loaded = service.LoadDefinitions(null);
        var loadedDef = Assert.Single(loaded, d => d.WorkflowName == "Test");
        Assert.Equal(2, loadedDef.Version);
    }

    [Fact]
    public void RollbackWorkflow_RestoresPreviousVersion()
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var executors = new List<IWorkflowStepExecutor> { new CreateEntityExecutor() };
        var registry = new WorkflowStepExecutorRegistry(executors);
        var service = new WorkflowService(config, history, registry);

        var wf = new WorkflowDefinition { WorkflowName = "Test", Steps = new() { new WorkflowStep { Type = "A" } } };
        service.SaveWorkflow(wf);
        wf.Steps.Add(new WorkflowStep { Type = "B" });
        service.SaveWorkflow(wf);

        service.RollbackWorkflow("Test", 1);
        var current = service.GetWorkflow("Test")!;
        Assert.Equal(3, current.Version);
    }
}
