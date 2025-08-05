using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
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
        modelBuilder.ApplyConfiguration(new WorkflowDefinitionRecordConfiguration());
        modelBuilder.ApplyConfiguration(new WorkflowStepRecordConfiguration());
        modelBuilder.ApplyConfiguration(new FileAssetConfiguration());
    }
}

public class WorkflowDefinitionRecordConfiguration : IEntityTypeConfiguration<WorkflowDefinitionRecord>
{
    public void Configure(EntityTypeBuilder<WorkflowDefinitionRecord> builder)
    {
        builder.HasMany(d => d.Steps)
            .WithOne(s => s.WorkflowDefinition)
            .HasForeignKey(s => s.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(d => d.GlobalVariables)
            .WithOne(v => v.WorkflowDefinition)
            .HasForeignKey(v => v.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class WorkflowStepRecordConfiguration : IEntityTypeConfiguration<WorkflowStepRecord>
{
    public void Configure(EntityTypeBuilder<WorkflowStepRecord> builder)
    {
        builder.HasMany(s => s.Parameters)
            .WithOne(p => p.WorkflowStep)
            .HasForeignKey(p => p.WorkflowStepId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class FileAssetConfiguration : IEntityTypeConfiguration<FileAsset>
{
    public void Configure(EntityTypeBuilder<FileAsset> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.FileName).IsRequired().HasMaxLength(255);
        builder.Property(e => e.Path).IsRequired().HasMaxLength(500);
        builder.Property(e => e.ContentType).HasMaxLength(100);
        builder.Property(e => e.Size).IsRequired();
        builder.Property(e => e.UploadedAt).IsRequired();
        // Optional: Add index for frequent queries
        builder.HasIndex(e => e.Path);
    }
}