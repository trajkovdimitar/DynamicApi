using Microsoft.EntityFrameworkCore;
namespace DynamicData
{
    public class DynamicDbContext : DbContext
    {
        public DynamicDbContext(DbContextOptions<DynamicDbContext> options) : base(options) {}
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<CustomerTest> CustomerTests { get; set; }
        public DbSet<Teeeee> Teeeees { get; set; }
        public DbSet<Teeeee2> Teeeee2s { get; set; }
        public DbSet<Teeeee2223> Teeeee2223s { get; set; }
        public DbSet<TEST2> TEST2s { get; set; }
        public DbSet<TEST3> TEST3s { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).IsRequired();
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
            });
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Price).IsRequired();
            });
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(e => e.CustomerId);
                entity.Property(e => e.CustomerId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.IsActive).IsRequired();
            });
            modelBuilder.Entity<CustomerTest>(entity =>
            {
                entity.HasKey(e => e.CustomerId);
                entity.Property(e => e.CustomerId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.IsActive).IsRequired();
            });
            modelBuilder.Entity<Teeeee>(entity =>
            {
                entity.HasKey(e => e.TeeeId);
                entity.Property(e => e.TeeeId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.IsActive).IsRequired();
            });
            modelBuilder.Entity<Teeeee2>(entity =>
            {
                entity.HasKey(e => e.TeeeId);
                entity.Property(e => e.TeeeId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.IsActive).IsRequired();
            });
            modelBuilder.Entity<Teeeee2223>(entity =>
            {
                entity.HasKey(e => e.TeeeId);
                entity.Property(e => e.TeeeId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.IsActive).IsRequired();
            });
            modelBuilder.Entity<TEST2>(entity =>
            {
                entity.HasKey(e => e.TeeeId);
                entity.Property(e => e.TeeeId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.IsActive).IsRequired();
            });
            modelBuilder.Entity<TEST3>(entity =>
            {
                entity.HasKey(e => e.TeeeId);
                entity.Property(e => e.TeeeId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.IsActive).IsRequired();
            });
        }
    }
}
