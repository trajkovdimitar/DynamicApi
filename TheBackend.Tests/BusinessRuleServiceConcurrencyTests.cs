using RulesEngine.Models;
using System.Threading.Tasks;
using TheBackend.DynamicModels;
using Xunit;
using Rule = RulesEngine.Models.Rule;

namespace TheBackend.Tests;

public class BusinessRuleServiceConcurrencyTests
{
    [Fact]
    public void AddOrUpdateWorkflow_IsThreadSafe()
    {
        var tempFile = Path.GetTempFileName();
        try
        {
            var service = new BusinessRuleService(tempFile);
            var workflows = Enumerable.Range(0, 50).Select(i => new Workflow
            {
                WorkflowName = $"Test{i}",
                Rules = new List<Rule> { new Rule { RuleName = "AlwaysTrue", Expression = "true" } }
            }).ToList();

            Parallel.ForEach(workflows, wf => service.AddOrUpdateWorkflow(wf));

            var reloaded = new BusinessRuleService(tempFile);
            Assert.Equal(workflows.Count, reloaded.GetWorkflows().Count);
            foreach (var wf in workflows)
            {
                Assert.True(reloaded.HasWorkflow(wf.WorkflowName));
            }
        }
        finally
        {
            File.Delete(tempFile);
        }
    }
}
