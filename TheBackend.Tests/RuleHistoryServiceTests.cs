using Microsoft.Extensions.Configuration;
using RulesEngine.Models;
using TheBackend.DynamicModels;
using Xunit;
using Rule = RulesEngine.Models.Rule;

namespace TheBackend.Tests;

public class RuleHistoryServiceTests
{
    [Fact]
    public void RecordRuleChange_PersistsHash()
    {
        var config = new ConfigurationBuilder().Build();
        var service = new RuleHistoryService(config);
        var workflow = new Workflow
        {
            WorkflowName = "TestWorkflow",
            Rules = new List<Rule> { new Rule { RuleName = "AlwaysTrue", Expression = "true" } }
        };
        service.RecordRuleChange(workflow, "Created", "abc");
        Assert.Equal("abc", service.GetLastHash());
    }
}
