using Microsoft.EntityFrameworkCore;
using TheBackend.Infrastructure.Repositories;
using TheBackend.Application.Events;
using Xunit;

namespace TheBackend.Tests;

public class GenericRepositoryTests
{
    private class TestEntity
    {
        public int Id { get; set; }
        public string? Name { get; set; }
    }

    private class TestDbContext : DbContext
    {
        public DbSet<TestEntity> Entities { get; set; } = null!;

        public TestDbContext(DbContextOptions<TestDbContext> options)
            : base(options)
        {
        }
    }

    [Fact]
    public async Task AddUpdateDeleteCycle()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var context = new TestDbContext(options);
        var bus = new EventBus();
        var createdCount = 0;
        var updatedCount = 0;
        var deletedCount = 0;
        bus.RegisterHandler<ModelCreatedEvent>(e => { createdCount++; return Task.CompletedTask; });
        bus.RegisterHandler<ModelUpdatedEvent>(e => { updatedCount++; return Task.CompletedTask; });
        bus.RegisterHandler<ModelDeletedEvent>(e => { deletedCount++; return Task.CompletedTask; });
        var repo = new GenericRepository<TestEntity>(context, bus);

        var entity = new TestEntity { Id = 1, Name = "first" };
        await repo.AddAsync(entity);

        var fetched = await repo.GetByIdAsync(1);
        Assert.Equal("first", fetched?.Name);

        fetched!.Name = "second";
        await repo.UpdateAsync(fetched);
        var updatedEntity = await repo.GetByIdAsync(1);
        Assert.Equal("second", updatedEntity?.Name);

        await repo.DeleteAsync(1);
        var all = await repo.GetAllAsync();
        Assert.Empty(all);

        Assert.Equal(1, createdCount);
        Assert.Equal(1, updatedCount);
        Assert.Equal(1, deletedCount);
    }
}
