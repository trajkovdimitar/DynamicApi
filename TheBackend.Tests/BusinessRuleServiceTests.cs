using RulesEngine.Models;
using System;
using System.Data;
using System.IO;
using TheBackend.DynamicModels;
using Xunit;
using Rule = RulesEngine.Models.Rule;
using System.Threading.Tasks;

namespace TheBackend.Tests;

public class BusinessRuleServiceTests
{
    [Fact]
    public async Task AddOrUpdateWorkflow_PersistsWorkflow()
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
            await service.AddOrUpdateWorkflowAsync(workflow);

            var serviceReloaded = new BusinessRuleService(tempFile);
            Assert.True(serviceReloaded.HasWorkflow("TestWorkflow"));
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsSuccess()
    {
        var tempFile = Path.GetTempFileName();
        try
        {
            var service = new BusinessRuleService(tempFile);
            var workflow = new Workflow
            {
                WorkflowName = "Order.Create",
                Rules = new List<Rule>
                {
                    new Rule { RuleName = "AlwaysTrue", Expression = "true" }
                }
            };
            await service.AddOrUpdateWorkflowAsync(workflow);

            var obj = new { Id = 1 };
            var results = await service.ExecuteAsync("order.Create", new RuleParameter("entity", obj));

            Assert.Single(results);
            Assert.True(results[0].IsSuccess);
        }
        finally
        {
            File.Delete(tempFile);
        }
    }
}
