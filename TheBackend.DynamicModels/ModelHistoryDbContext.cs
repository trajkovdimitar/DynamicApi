using Microsoft.EntityFrameworkCore;
using TheBackend.Domain.Models;

namespace TheBackend.DynamicModels;

public class ModelHistoryDbContext : DbContext
{
    public DbSet<ModelHistory> ModelHistories { get; set; } = default!;
    public DbSet<RuleHistory> RuleHistories { get; set; } = default!;

    public ModelHistoryDbContext(DbContextOptions<ModelHistoryDbContext> options) : base(options) { }
}
