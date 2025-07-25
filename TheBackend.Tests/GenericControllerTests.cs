using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Configuration;
using TheBackend.Api;
using TheBackend.Api.Controllers;
using TheBackend.DynamicModels;
using TheBackend.DynamicModels.Workflows;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace TheBackend.Tests;

public class GenericControllerTests
{
    private static DynamicDbContextService CreateService()
    {
        var modelService = new ModelDefinitionService();
        var config = new ConfigurationBuilder().Build();
        var history = new ModelHistoryService(config);
        var service = new DynamicDbContextService(modelService, config, history);
        typeof(DynamicDbContextService)
            .GetField("_dynamicAssembly", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(GenericControllerTests).Assembly);
        return service;
    }

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
            .GetField("_dynamicAssembly", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(TestEntity).Assembly);
        typeof(DynamicDbContextService)
            .GetField("_dynamicDbContextType", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(service, typeof(TestDbContext));
        return service;
    }

    private static WorkflowService CreateWorkflowService()
    {
        var config = new ConfigurationBuilder().Build();
        var history = new WorkflowHistoryService(config);
        return new WorkflowService(config, history);
    }

    [Fact]
    public async Task GetAll_ReturnsNotFound_ForUnknownModel()
    {
        using var dbService = CreateService();
        var ruleService = new BusinessRuleService(Path.GetTempFileName());
        var wfService = CreateWorkflowService();
        var controller = new GenericController(dbService, ruleService, wfService, NullLogger<GenericController>.Instance);

        var result = await controller.GetAll("UnknownModel");

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponse<object>>(notFound.Value);
        Assert.Equal("Model not found", response.Message);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_ForUnknownModel()
    {
        using var dbService = CreateService();
        var ruleService = new BusinessRuleService(Path.GetTempFileName());
        var wfService = CreateWorkflowService();
        var controller = new GenericController(dbService, ruleService, wfService, NullLogger<GenericController>.Instance);

        var result = await controller.GetById("UnknownModel", "1");

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponse<object>>(notFound.Value);
        Assert.Equal("Model not found", response.Message);
    }

    [Fact]
    public async Task Post_CreatesEntity()
    {
        using var dbService = CreateInMemoryService();
        var tempFile = Path.GetTempFileName();
        try
        {
            var ruleService = new BusinessRuleService(tempFile);
            var wfService = CreateWorkflowService();
            var controller = new GenericController(dbService, ruleService, wfService, NullLogger<GenericController>.Instance)
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            var entity = new TestEntity { Id = 1, Name = "first" };
            var json = JsonConvert.SerializeObject(entity);
            controller.ControllerContext.HttpContext.Request.Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(json));

            var result = await controller.Post(nameof(TestEntity));

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<object>>(ok.Value);
            var created = Assert.IsType<TestEntity>(response.Data);
            Assert.Equal("first", created.Name);
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    [Fact]
    public async Task Get_ReturnsEntity()
    {
        using var dbService = CreateInMemoryService();
        var tempFile = Path.GetTempFileName();
        try
        {
            var ruleService = new BusinessRuleService(tempFile);
            var wfService = CreateWorkflowService();
            var controller = new GenericController(dbService, ruleService, wfService, NullLogger<GenericController>.Instance)
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            var entity = new TestEntity { Id = 2, Name = "second" };
            var json = JsonConvert.SerializeObject(entity);
            controller.ControllerContext.HttpContext.Request.Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(json));
            await controller.Post(nameof(TestEntity));

            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            var result = await controller.GetById(nameof(TestEntity), "2");

            var ok = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<object>>(ok.Value);
            var fetched = Assert.IsType<TestEntity>(response.Data);
            Assert.Equal("second", fetched.Name);
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    [Fact]
    public async Task PutAndDelete_UpdatesAndRemovesEntity()
    {
        using var dbService = CreateInMemoryService();
        var tempFile = Path.GetTempFileName();
        try
        {
            var ruleService = new BusinessRuleService(tempFile);
            var wfService = CreateWorkflowService();
            var controller = new GenericController(dbService, ruleService, wfService, NullLogger<GenericController>.Instance)
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            var entity = new TestEntity { Id = 3, Name = "third" };
            var json = JsonConvert.SerializeObject(entity);
            controller.ControllerContext.HttpContext.Request.Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(json));
            await controller.Post(nameof(TestEntity));

            var updated = new TestEntity { Id = 3, Name = "updated" };
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            controller.ControllerContext.HttpContext.Request.Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(updated)));
            var putResult = await controller.Put(nameof(TestEntity), "3");
            var putOk = Assert.IsType<OkObjectResult>(putResult);
            var putResp = Assert.IsType<ApiResponse<object>>(putOk.Value);
            var putEntity = Assert.IsType<TestEntity>(putResp.Data);
            Assert.Equal("updated", putEntity.Name);

            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            var delResult = await controller.Delete(nameof(TestEntity), "3");
            var delOk = Assert.IsType<OkObjectResult>(delResult);
            var delResp = Assert.IsType<ApiResponse<object>>(delOk.Value);
            Assert.Equal("Deleted", delResp.Message);

            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            var getResult = await controller.GetById(nameof(TestEntity), "3");
            Assert.IsType<NotFoundObjectResult>(getResult);
        }
        finally
        {
            File.Delete(tempFile);
        }
    }
}

public class TestEntity
{
    public int Id { get; set; }
    public string? Name { get; set; }
}

public class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions<TestDbContext> options) : base(options) { }
    public DbSet<TestEntity> TestEntities { get; set; } = null!;
}
