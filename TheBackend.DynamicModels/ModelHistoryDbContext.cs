using Microsoft.EntityFrameworkCore;
using TheBackend.Domain.Models;

namespace TheBackend.DynamicModels;

public class ModelHistoryDbContext : DbContext
{
    public DbSet<ModelHistory> ModelHistories { get; set; } = default!;
    public DbSet<RuleHistory> RuleHistories { get; set; } = default!;
    public DbSet<WorkflowDefinitionRecord> WorkflowDefinitions { get; set; } = default!;
    public DbSet<WorkflowStepRecord> WorkflowSteps { get; set; } = default!;
    public DbSet<ParameterRecord> Parameters { get; set; } = default!;
    public DbSet<GlobalVariableRecord> GlobalVariables { get; set; } = default!;
    public DbSet<WorkflowHistoryRecord> WorkflowHistories { get; set; } = default!;
    public DbSet<FileAsset> FileAssets { get; set; } = default!;

    public ModelHistoryDbContext(DbContextOptions<ModelHistoryDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<WorkflowDefinitionRecord>()
            .HasMany(d => d.Steps)
            .WithOne(s => s.WorkflowDefinition)
            .HasForeignKey(s => s.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkflowDefinitionRecord>()
            .HasMany(d => d.GlobalVariables)
            .WithOne(v => v.WorkflowDefinition)
            .HasForeignKey(v => v.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkflowStepRecord>()
            .HasMany(s => s.Parameters)
            .WithOne(p => p.WorkflowStep)
            .HasForeignKey(p => p.WorkflowStepId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FileAsset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Path).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.Size).IsRequired();
            entity.Property(e => e.UploadedAt).IsRequired();
        });
    }
}
