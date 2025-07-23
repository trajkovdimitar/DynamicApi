using Microsoft.EntityFrameworkCore;
namespace TheBackend.DynamicModels
{
    public class DynamicDbContext : DbContext
    {
        public DynamicDbContext(DbContextOptions<DynamicDbContext> options) : base(options) {}
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).IsRequired();
                entity.Property(e => e.Username).IsRequired();
                entity.Property(e => e.Username).HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(150);
            });
            modelBuilder.Entity<Post>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).IsRequired();
                entity.Property(e => e.Title).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(200);
                entity.Property(e => e.UserId).IsRequired();
                entity.HasOne<User>(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId);
            });
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).IsRequired();
                entity.Property(e => e.PostId).IsRequired();
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.Content).HasMaxLength(500);
                entity.HasOne<Post>(e => e.Post)
                    .WithMany()
                    .HasForeignKey(e => e.PostId);
            });
        }
    }
}
