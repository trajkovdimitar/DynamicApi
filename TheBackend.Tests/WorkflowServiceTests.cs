using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.DependencyInjection;
using TheBackend.DynamicModels;
using TheBackend.DynamicModels.Workflows;
using Xunit;
using System.Collections.Generic;
using System;
using System.IO;

namespace TheBackend.Tests;

public class WorkflowServiceTests
{
    private static DynamicDbContextService CreateInMemoryService()
    {
        var modelService = new ModelDefinitionService();
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DbProvider"] = "InMemory",
                ["ConnectionStrings:Default"] = Guid.NewGuid().ToString()
            })
            .Build();
        var history = new ModelHistoryService(config);
        var service = new DynamicDbContextService(modelService, config, history);
        typeof(DynamicDbContextService)
            .GetField(
                "_dynamicAssembly",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(TestEntity).Assembly);
        typeof(DynamicDbContextService)
            .GetField(
                "_dynamicDbContextType",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(TestDbContext));
        return service;
    }

    private static WorkflowService CreateWorkflowService(IWorkflowStepExecutor executor)
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var services = new ServiceCollection();
        services.AddSingleton(executor.GetType(), executor);
        var provider = services.BuildServiceProvider();
        var registry = new WorkflowStepExecutorRegistry(new[] { executor }, provider);
        var modelService = new ModelDefinitionService();
        return new WorkflowService(history, registry, NullLogger<WorkflowService>.Instance, modelService);
    }

    public class CountingExecutor : IWorkflowStepExecutor<object, object>
    {
        public string SupportedType => "CreateEntity";
        public int Count { get; private set; }

        public Task<object?> ExecuteAsync(
            object? input,
            WorkflowStep step,
            DynamicDbContextService dbContextService,
            IServiceProvider serviceProvider,
            Dictionary<string, object> variables)
        {
            Count++;
            return Task.FromResult(input);
        }
    }

    [Fact]
    public async Task RunAsync_SkipsStep_WhenConditionFalse()
    {
        using var dbService = CreateInMemoryService();
        var executor = new CountingExecutor();
        var wfService = CreateWorkflowService(executor);
        var wf = new WorkflowDefinition
        {
            WorkflowName = "CondTest",
            IsTransactional = false,
            GlobalVariables = new List<GlobalVariable>
            {
                new() { Key = "Amount", ValueType = "int", Value = "50" }
            },
            Steps = new List<WorkflowStep>
            {
                new()
                {
                    Type = executor.SupportedType,
                    Condition = "Vars.Amount > 100",
                    Parameters = new List<Parameter>
                    {
                        new() { Key = "ModelName", ValueType = "string", Value = "TestEntity" }
                    }
                }
            }
        };
        wfService.SaveWorkflow(wf);
        await wfService.RunAsync("CondTest", dbService, new object(), new ServiceCollection().BuildServiceProvider());
        Assert.Equal(0, executor.Count);
    }

    public class FailingExecutor : IWorkflowStepExecutor<object, object>
    {
        private readonly int _failures;
        private int _attempts;
        public string SupportedType => "CreateEntity";
        public int Attempts => _attempts;

        public FailingExecutor(int failures)
        {
            _failures = failures;
        }

        public Task<object?> ExecuteAsync(
            object? input,
            WorkflowStep step,
            DynamicDbContextService dbContextService,
            IServiceProvider serviceProvider,
            Dictionary<string, object> variables)
        {
            _attempts++;
            if (_attempts <= _failures)
                throw new InvalidOperationException("fail");
            return Task.FromResult(input);
        }
    }

    [Fact]
    public async Task RunAsync_Retries_OnErrorRetry()
    {
        using var dbService = CreateInMemoryService();
        var executor = new FailingExecutor(2);
        var wfService = CreateWorkflowService(executor);
        var wf = new WorkflowDefinition
        {
            WorkflowName = "RetryTest",
            IsTransactional = false,
            Steps = new List<WorkflowStep>
            {
                new()
                {
                    Type = executor.SupportedType,
                    OnError = "Retry:3",
                    Parameters = new List<Parameter>
                    {
                        new() { Key = "ModelName", ValueType = "string", Value = "TestEntity" }
                    }
                }
            }
        };
        wfService.SaveWorkflow(wf);
        await wfService.RunAsync("RetryTest", dbService, new object(), new ServiceCollection().BuildServiceProvider());
        Assert.Equal(3, executor.Attempts);
    }

    [Fact]
    public void SaveWorkflow_Throws_ForUnknownStepType()
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var registry = new WorkflowStepExecutorRegistry(new List<IWorkflowStepExecutor>(), new ServiceCollection().BuildServiceProvider());
        var wfService = new WorkflowService(history, registry, NullLogger<WorkflowService>.Instance, new ModelDefinitionService());
        var wf = new WorkflowDefinition
        {
            WorkflowName = "Bad",
            Steps = new List<WorkflowStep> { new() { Type = "Unknown" } }
        };
        Assert.Throws<ArgumentException>(() => wfService.SaveWorkflow(wf));
    }

    [Fact]
    public void SaveWorkflow_Throws_WhenRequiredParameterMissing()
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var executor = new CreateEntityExecutor<object, object>();
        var services = new ServiceCollection();
        services.AddSingleton(executor.GetType(), executor);
        var registry = new WorkflowStepExecutorRegistry(new[] { executor }, services.BuildServiceProvider());
        var modelsPath = Path.GetTempFileName();
        File.WriteAllText(modelsPath, "[{\"ModelName\":\"TestEntity\",\"Properties\":[]}]");
        var wfService = new WorkflowService(history, registry, NullLogger<WorkflowService>.Instance, new ModelDefinitionService(modelsPath));
        var wf = new WorkflowDefinition
        {
            WorkflowName = "Bad",
            Steps = new List<WorkflowStep> { new() { Type = executor.SupportedType } }
        };
        Assert.Throws<ArgumentException>(() => wfService.SaveWorkflow(wf));
        File.Delete(modelsPath);
    }

    [Fact]
    public void SaveWorkflow_Throws_ForInvalidModelName()
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var executor = new CreateEntityExecutor<object, object>();
        var services = new ServiceCollection();
        services.AddSingleton(executor.GetType(), executor);
        var registry = new WorkflowStepExecutorRegistry(new[] { executor }, services.BuildServiceProvider());
        var modelsPath = Path.GetTempFileName();
        File.WriteAllText(modelsPath, "[{\"ModelName\":\"TestEntity\",\"Properties\":[]}]");
        var wfService = new WorkflowService(history, registry, NullLogger<WorkflowService>.Instance, new ModelDefinitionService(modelsPath));
        var wf = new WorkflowDefinition
        {
            WorkflowName = "Bad",
            Steps = new List<WorkflowStep>
            {
                new()
                {
                    Type = executor.SupportedType,
                    Parameters = new List<Parameter>
                    {
                        new() { Key = "ModelName", ValueType = "string", Value = "NoSuchModel" }
                    }
                }
            }
        };
        Assert.Throws<ArgumentException>(() => wfService.SaveWorkflow(wf));
    }

    [Fact]
    public void SaveWorkflow_Throws_ForInvalidValueType()
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var executor = new CreateEntityExecutor<object, object>();
        var services = new ServiceCollection();
        services.AddSingleton(executor.GetType(), executor);
        var registry = new WorkflowStepExecutorRegistry(new[] { executor }, services.BuildServiceProvider());
        var wfService = new WorkflowService(history, registry, NullLogger<WorkflowService>.Instance, new ModelDefinitionService());
        var wf = new WorkflowDefinition
        {
            WorkflowName = "Bad",
            Steps = new List<WorkflowStep>
            {
                new()
                {
                    Type = executor.SupportedType,
                    Parameters = new List<Parameter>
                    {
                        new() { Key = "ModelName", ValueType = "unknown", Value = "User" }
                    }
                }
            }
        };
        Assert.Throws<ArgumentException>(() => wfService.SaveWorkflow(wf));
    }

    [Fact]
    public void SaveWorkflow_Throws_ForDuplicateGlobalVariable()
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var executor = new CreateEntityExecutor<object, object>();
        var services = new ServiceCollection();
        services.AddSingleton(executor.GetType(), executor);
        var registry = new WorkflowStepExecutorRegistry(new[] { executor }, services.BuildServiceProvider());
        var wfService = new WorkflowService(history, registry, NullLogger<WorkflowService>.Instance, new ModelDefinitionService());
        var wf = new WorkflowDefinition
        {
            WorkflowName = "Bad",
            GlobalVariables = new List<GlobalVariable>
            {
                new() { Key = "Var", ValueType = "string", Value = "1" },
                new() { Key = "Var", ValueType = "string", Value = "2" }
            },
            Steps = new List<WorkflowStep>
            {
                new()
                {
                    Type = executor.SupportedType,
                    Parameters = new List<Parameter>
                    {
                        new() { Key = "ModelName", ValueType = "string", Value = "User" }
                    }
                }
            }
        };
        Assert.Throws<ArgumentException>(() => wfService.SaveWorkflow(wf));
    }

    [Fact]
    public void SaveWorkflow_Allows_LogEventStep()
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config, Guid.NewGuid().ToString());
        var executor = new LogEventExecutor<object>(NullLogger<LogEventExecutor<object>>.Instance);
        var services = new ServiceCollection();
        services.AddSingleton(executor.GetType(), executor);
        var registry = new WorkflowStepExecutorRegistry(new[] { executor }, services.BuildServiceProvider());
        var wfService = new WorkflowService(history, registry, NullLogger<WorkflowService>.Instance, new ModelDefinitionService());
        var wf = new WorkflowDefinition
        {
            WorkflowName = "LogTest",
            Steps = new List<WorkflowStep>
            {
                new()
                {
                    Type = executor.SupportedType,
                    Parameters = new List<Parameter>
                    {
                        new() { Key = "Message", ValueType = "string", Value = "Hello" }
                    }
                }
            }
        };
        var ex = Record.Exception(() => wfService.SaveWorkflow(wf));
        Assert.Null(ex);
    }
}
