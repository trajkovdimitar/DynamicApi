using Microsoft.EntityFrameworkCore;
using TheBackend.Infrastructure.Repositories;
using Xunit;

namespace TheBackend.Tests;

public class RelationshipCrudTests
{
    private class Customer
    {
        public int CustomerId { get; set; }
        public string? Name { get; set; }
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    private class Order
    {
        public int OrderId { get; set; }
        public int CustomerId { get; set; }
        public decimal Amount { get; set; }
        public Customer? Customer { get; set; }
    }

    private class TestDbContext : DbContext
    {
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;

        public TestDbContext(DbContextOptions<TestDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId);
        }
    }

    [Fact]
    public async Task CrudOperations_WithRelatedEntities()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var context = new TestDbContext(options);
        var customerRepo = new GenericRepository<Customer>(context);
        var orderRepo = new GenericRepository<Order>(context);

        var customer = new Customer { CustomerId = 1, Name = "Alice" };
        await customerRepo.AddAsync(customer);

        var order = new Order { OrderId = 10, CustomerId = 1, Amount = 25.5m };
        await orderRepo.AddAsync(order);

        var fetched = await orderRepo.GetByIdAsync(10);
        Assert.Equal(1, fetched!.CustomerId);
        await context.Entry(fetched).Reference(o => o.Customer).LoadAsync();
        Assert.Equal("Alice", fetched.Customer!.Name);

        fetched.Amount = 30m;
        await orderRepo.UpdateAsync(fetched);
        var updated = await orderRepo.GetByIdAsync(10);
        Assert.Equal(30m, updated!.Amount);

        await orderRepo.DeleteAsync(10);
        var remaining = await orderRepo.GetAllAsync();
        Assert.Empty(remaining);
    }
}
