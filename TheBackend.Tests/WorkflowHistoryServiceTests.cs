using Microsoft.Extensions.Configuration;
using TheBackend.DynamicModels.Workflows;
using Xunit;

namespace TheBackend.Tests;

public class WorkflowHistoryServiceTests
{
    [Fact]
    public void SaveWorkflow_PersistsToDatabase()
    {
        var config = new ConfigurationBuilder().Build();
        var service = new WorkflowHistoryService(config);
        var wf = new WorkflowDefinition { WorkflowName = "Test", Steps = new() };
        service.SaveDefinition(wf);
        var loaded = service.LoadDefinitions(null);
        Assert.Contains(loaded, d => d.WorkflowName == "Test");
    }
}
