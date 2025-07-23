using Microsoft.EntityFrameworkCore;
using TheBackend.Domain.Models;

namespace TheBackend.DynamicModels
{
    public class DynamicDbContext : DbContext
    {
        public DynamicDbContext(DbContextOptions<DynamicDbContext> options) : base(options) { }

        public DbSet<ModelHistory> ModelHistories { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ModelHistory>();
        }
    }
}
