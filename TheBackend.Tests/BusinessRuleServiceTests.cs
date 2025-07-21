using RulesEngine.Models;
using System;
using System.Data;
using System.IO;
using TheBackend.DynamicModels;
using Xunit;
using Rule = RulesEngine.Models.Rule;

namespace TheBackend.Tests;

public class BusinessRuleServiceTests
{
    [Fact]
    public void AddOrUpdateWorkflow_PersistsWorkflow()
    {
        var tempFile = Path.GetTempFileName();
        try
        {
            var service = new BusinessRuleService(tempFile);
            var workflow = new Workflow
            {
                WorkflowName = "TestWorkflow",
                Rules = new List<Rule>
                {
                    new Rule { RuleName = "AlwaysTrue", Expression = "true" }
                }
            };
            service.AddOrUpdateWorkflow(workflow);

            var serviceReloaded = new BusinessRuleService(tempFile);
            Assert.True(serviceReloaded.HasWorkflow("TestWorkflow"));
        }
        finally
        {
            File.Delete(tempFile);
        }
    }
}
