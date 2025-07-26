using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using System.Diagnostics;
using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using TheBackend.Domain.Models;
using TheBackend.DynamicModels;
using System.Linq;
using System.Collections.Generic;

namespace TheBackend.DynamicModels;

public class DynamicDbContextService : IDisposable
{
    private readonly ModelDefinitionService _modelService;
    private readonly IConfiguration _config;
    private readonly ModelHistoryService _historyService;
    private Assembly _dynamicAssembly = default!;
    private Type _dynamicDbContextType = default!;
    private AssemblyLoadContext? _loadContext;
    private readonly InMemoryDatabaseRoot _inMemoryRoot = new();

    private readonly string ProjectDir;
    private string ModelsDir => Path.Combine(ProjectDir, "Models");
    private string MigrationsDir => Path.Combine(ProjectDir, "Migrations");
    private string DbContextFile => Path.Combine(ProjectDir, "DynamicDbContext.cs");
    private string DesignTimeFactoryFile => Path.Combine(ProjectDir, "DesignTimeFactory.cs");

    public ModelDefinition? GetModelDefinition(string modelName)
    {
        return _modelService
            .LoadModels()
            .FirstOrDefault(m => m.ModelName.Equals(modelName, StringComparison.OrdinalIgnoreCase));
    }

    public DynamicDbContextService(ModelDefinitionService modelService, IConfiguration config, ModelHistoryService historyService)
    {
        _modelService = modelService;
        _config = config;
        _historyService = historyService;
        ProjectDir = GetProjectDirectory();
        Directory.CreateDirectory(ModelsDir);
        Directory.CreateDirectory(MigrationsDir);
    }

    private static string GetProjectDirectory()
    {
        var directory = AppDomain.CurrentDomain.BaseDirectory;
        return Path.GetFullPath(Path.Combine(directory, "..", "..", "..", "..", "TheBackend.DynamicModels"));
    }

    public async Task RegenerateAndMigrateAsync()
    {
        var models = _modelService.LoadModels();
        var currentHash = _modelService.ComputeModelsHash();
        var lastHash = _historyService.GetLastHash() ?? _modelService.LoadLastModelsHash();

        foreach (var model in models)
        {
            File.WriteAllText(
                Path.Combine(ModelsDir, $"{model.ModelName}.cs"),
                GenerateSingleModelCode(model, models));
        }
        File.WriteAllText(DbContextFile, GenerateDbContextCode(models));
        File.WriteAllText(DesignTimeFactoryFile, GenerateDesignTimeFactory());

        if (currentHash != lastHash)
        {
            try
            {
                var cmd =
                    $"ef migrations add AutoMigration_{DateTime.UtcNow:yyyyMMddHHmmss} " +
                    "--context DynamicDbContext " +
                    "--namespace TheBackend.DynamicModels.Migrations --output-dir Migrations";
                RunDotnetCommand(cmd, ProjectDir);
                _modelService.SaveModelsHash(currentHash);
                _historyService.RecordSnapshot(currentHash);
            }
            catch (Exception ex)
            {
                var noChange = ex.Message.Contains("No migrations were added") ||
                               ex.Message.Contains("The model has not changed");
                if (!noChange)
                    throw;
            }
        }

        _dynamicAssembly = CompileInMemory(models);
        _dynamicDbContextType = _dynamicAssembly.GetType("TheBackend.DynamicModels.DynamicDbContext")
            ?? throw new InvalidOperationException("DynamicDbContext not found");

        using var dbContext = CreateDbContextInstance();

        await dbContext.Database.MigrateAsync();
    }

    private string GenerateDesignTimeFactory()
    {
        var connString = _config.GetConnectionString("Default")!.Replace(@"\", @"\\").Replace("\"", "\\\"");
        var dbProvider = _config["DbProvider"];
        var useProvider = dbProvider == "SqlServer"
            ? $"optionsBuilder.UseSqlServer(\"{connString}\");"
            : dbProvider == "Postgres"
                ? $"optionsBuilder.UseNpgsql(\"{connString}\");"
                : $"optionsBuilder.UseInMemoryDatabase(\"{connString}\");";
        return $@"using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TheBackend.DynamicModels
{{
    public class DesignTimeFactory : IDesignTimeDbContextFactory<DynamicDbContext>
    {{
        public DynamicDbContext CreateDbContext(string[] args)
        {{
            var optionsBuilder = new DbContextOptionsBuilder<DynamicDbContext>();
            {useProvider}
            return new DynamicDbContext(optionsBuilder.Options);
        }}
    }}
}}";
    }

    private Assembly CompileInMemory(List<ModelDefinition> models)
    {
        var syntaxTrees = new List<SyntaxTree>();
        foreach (var model in models)
        {
            var modelFile = Path.Combine(ModelsDir, $"{model.ModelName}.cs");
            var modelCode = File.ReadAllText(modelFile);
            syntaxTrees.Add(CSharpSyntaxTree.ParseText(modelCode));
        }
        syntaxTrees.Add(CSharpSyntaxTree.ParseText(File.ReadAllText(DbContextFile)));

        if (Directory.Exists(MigrationsDir))
        {
            foreach (var file in Directory.GetFiles(MigrationsDir, "*.cs"))
            {
                syntaxTrees.Add(CSharpSyntaxTree.ParseText(File.ReadAllText(file)));
            }
        }

        var dbProvider = _config["DbProvider"];
        string providerAssemblyName = dbProvider == "SqlServer"
            ? "Microsoft.EntityFrameworkCore.SqlServer"
            : dbProvider == "Postgres"
                ? "Npgsql.EntityFrameworkCore.PostgreSQL"
                : "Microsoft.EntityFrameworkCore.InMemory";
        var providerAssembly = AppDomain.CurrentDomain
            .GetAssemblies()
            .FirstOrDefault(a => a.GetName().Name == providerAssemblyName);
        if (providerAssembly == null)
        {
            providerAssembly = Assembly.Load(providerAssemblyName);
        }

        var references = AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => !a.IsDynamic && !string.IsNullOrEmpty(a.Location))
            .Select(a => MetadataReference.CreateFromFile(a.Location)).ToList();

        if (providerAssembly != null)
        {
            references.Add(MetadataReference.CreateFromFile(providerAssembly.Location));
        }

        var compilation = CSharpCompilation.Create(
            "DynamicModelsAssembly",
            syntaxTrees,
            references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

        using var ms = new MemoryStream();
        var result = compilation.Emit(ms);

        if (!result.Success)
        {
            var errors = string.Join("\n", result.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error));
            throw new Exception($"Compilation failed:\n{errors}");
        }

        ms.Seek(0, SeekOrigin.Begin);
        _loadContext?.Unload();
        _loadContext = new AssemblyLoadContext("DynamicContext", isCollectible: true);
        return _loadContext.LoadFromStream(ms);
    }

    private DbContext CreateDbContextInstance()
    {
        var connString = _config.GetConnectionString("Default");
        var dbProvider = _config["DbProvider"];

        var builderType = typeof(DbContextOptionsBuilder<>).MakeGenericType(_dynamicDbContextType);
        var optionsBuilder = (DbContextOptionsBuilder)Activator.CreateInstance(builderType)!;

        if (dbProvider == "SqlServer")
            optionsBuilder.UseSqlServer(connString);
        else if (dbProvider == "Postgres")
            optionsBuilder.UseNpgsql(connString);
        else if (dbProvider == "InMemory")
            optionsBuilder.UseInMemoryDatabase(connString ?? "DynamicInMemory", _inMemoryRoot);
        else
            throw new NotSupportedException("Unknown provider");

        var options = optionsBuilder.Options;

        return (DbContext)Activator.CreateInstance(_dynamicDbContextType, options)!;
    }

    private void RunDotnetCommand(string arguments, string? workingDir = null)
    {
        using var process = new Process();
        process.StartInfo.FileName = "dotnet";
        process.StartInfo.Arguments = arguments;
        process.StartInfo.WorkingDirectory = workingDir ?? Directory.GetCurrentDirectory();
        process.StartInfo.UseShellExecute = false;
        process.StartInfo.RedirectStandardOutput = true;
        process.StartInfo.RedirectStandardError = true;
        process.Start();

        string output = process.StandardOutput.ReadToEnd();
        string error = process.StandardError.ReadToEnd();
        process.WaitForExit();

        if (process.ExitCode != 0)
        {
            string buildOutput = "";
            string buildError = "";
            if (arguments.StartsWith("ef migrations add") && output.Contains("Build failed"))
            {
                using var buildProcess = new Process();
                buildProcess.StartInfo.FileName = "dotnet";
                buildProcess.StartInfo.Arguments = "build";
                buildProcess.StartInfo.WorkingDirectory = workingDir;
                buildProcess.StartInfo.UseShellExecute = false;
                buildProcess.StartInfo.RedirectStandardOutput = true;
                buildProcess.StartInfo.RedirectStandardError = true;
                buildProcess.Start();

                buildOutput = buildProcess.StandardOutput.ReadToEnd();
                buildError = buildProcess.StandardError.ReadToEnd();
                buildProcess.WaitForExit();
            }
            var msg =
                $"dotnet {arguments} failed:\nOutput:\n{output}\nError:\n{error}\n" +
                $"Build Output:\n{buildOutput}\nBuild Error:\n{buildError}";
            throw new Exception(msg);
        }
    }

    private string GenerateSingleModelCode(
        ModelDefinition model,
        List<ModelDefinition> allModels,
        string @namespace = "TheBackend.DynamicModels")
    {
        var sb = new StringBuilder();
        sb.AppendLine("using System;");
        sb.AppendLine("using System.Collections.Generic;");
        sb.AppendLine("using System.Linq;");
        sb.AppendLine("using System.Text;");
        sb.AppendLine("using System.Threading.Tasks;");
        sb.AppendLine($"namespace {@namespace}");
        sb.AppendLine("{");
        sb.AppendLine($"    public class {model.ModelName}");
        sb.AppendLine("    {");
        foreach (var prop in model.Properties)
            sb.AppendLine($"        public {prop.Type} {prop.Name} {{ get; set; }}");

        var neededForeignKeys = allModels
            .SelectMany(m => m.Relationships.Select(r => (Model: m, Rel: r)))
            .Where(x =>
                x.Rel.TargetModel == model.ModelName &&
                x.Rel.RelationshipType == "OneToMany" &&
                !string.IsNullOrWhiteSpace(x.Rel.ForeignKey) &&
                !model.Properties.Any(p => p.Name == x.Rel.ForeignKey))
            .ToList();

        foreach (var (principalModel, rel) in neededForeignKeys)
        {
            var fkType = principalModel.Properties.FirstOrDefault(p => p.IsKey)?.Type ?? "int";
            sb.AppendLine($"        public {fkType} {rel.ForeignKey} {{ get; set; }}");
        }

        var inverseNavigations = allModels
            .SelectMany(m => m.Relationships.Select(r => (Model: m, Rel: r)))
            .Where(x =>
                x.Rel.TargetModel == model.ModelName &&
                !string.IsNullOrWhiteSpace(x.Rel.InverseNavigation))
            .ToList();

        foreach (var (sourceModel, rel) in inverseNavigations)
        {
            var inverseName = rel.InverseNavigation!;
            if (model.Relationships.Any(r => r.NavigationName == inverseName) ||
                model.Properties.Any(p => p.Name == inverseName))
            {
                continue;
            }
            var relationshipType = rel.RelationshipType switch
            {
                "ManyToOne" => "OneToMany",
                "OneToMany" => "ManyToOne",
                _ => rel.RelationshipType
            };
            var isCollection = relationshipType == "OneToMany" || relationshipType == "ManyToMany";
            if (isCollection)
            {
                sb.AppendLine(
                    $"        public ICollection<{sourceModel.ModelName}> {inverseName} {{ get; set; }} = new List<{sourceModel.ModelName}>();");
            }
            else
            {
                sb.AppendLine($"        public {sourceModel.ModelName}? {inverseName} {{ get; set; }}");
            }
        }

        foreach (var rel in model.Relationships)
        {
            var fkOnThis = rel.RelationshipType == "ManyToOne" || rel.RelationshipType == "OneToOne";
            if (fkOnThis &&
                !string.IsNullOrWhiteSpace(rel.ForeignKey) &&
                !model.Properties.Any(p => p.Name == rel.ForeignKey))
            {
                var targetKeyType = allModels
                    .FirstOrDefault(m => m.ModelName == rel.TargetModel)?
                    .Properties.FirstOrDefault(p => p.IsKey)?.Type;
                var fkType = targetKeyType ?? "int";
                sb.AppendLine($"        public {fkType} {rel.ForeignKey} {{ get; set; }}");
            }

            var isCollection = rel.RelationshipType == "OneToMany" || rel.RelationshipType == "ManyToMany";
            if (isCollection)
                sb.AppendLine(
                    $"        public ICollection<{rel.TargetModel}> {rel.NavigationName} {{ get; set; }} = " +
                    $"new List<{rel.TargetModel}>();");
            else
                sb.AppendLine($"        public {rel.TargetModel}? {rel.NavigationName} {{ get; set; }}");
        }
        sb.AppendLine("    }");
        sb.AppendLine("}");
        return sb.ToString();
    }

    private string GenerateDbContextCode(List<ModelDefinition> models, string @namespace = "TheBackend.DynamicModels")
    {
        var sb = new StringBuilder();
        sb.AppendLine("using Microsoft.EntityFrameworkCore;");
        sb.AppendLine($"namespace {@namespace}");
        sb.AppendLine("{");
        sb.AppendLine("    public class DynamicDbContext : DbContext");
        sb.AppendLine("    {");
        sb.AppendLine("        public DynamicDbContext(DbContextOptions<DynamicDbContext> options) : base(options) { }");
        foreach (var model in models)
            sb.AppendLine($"        public DbSet<{model.ModelName}> {model.ModelName}s {{ get; set; }}");
        sb.AppendLine("        protected override void OnModelCreating(ModelBuilder modelBuilder)");
        sb.AppendLine("        {");
        foreach (var model in models)
        {
            sb.AppendLine($"            modelBuilder.Entity<{model.ModelName}>(entity =>");
            sb.AppendLine("            {");
            foreach (var prop in model.Properties)
            {
                if (prop.IsKey)
                    sb.AppendLine($"                entity.HasKey(e => e.{prop.Name});");
                if (prop.IsRequired)
                    sb.AppendLine($"                entity.Property(e => e.{prop.Name}).IsRequired();");
                if (prop.MaxLength.HasValue)
                    sb.AppendLine(
                        $"                entity.Property(e => e.{prop.Name}).HasMaxLength({prop.MaxLength});");
            }
            foreach (var rel in model.Relationships)
            {
                if (!models.Any(m => m.ModelName == rel.TargetModel))
                    continue;

                var hasFk = !string.IsNullOrWhiteSpace(rel.ForeignKey);
                var inverse = string.IsNullOrWhiteSpace(rel.InverseNavigation) ? null : rel.InverseNavigation;
                switch (rel.RelationshipType)
                {
                    case "ManyToOne":
                        sb.AppendLine($"                entity.HasOne<{rel.TargetModel}>(e => e.{rel.NavigationName})");
                        sb.Append("                    .WithMany(");
                        sb.Append(string.IsNullOrWhiteSpace(inverse) ? ")" : $"d => d.{inverse})");
                        if (hasFk)
                        {
                            sb.AppendLine();
                            sb.AppendLine($"                    .HasForeignKey(e => e.{rel.ForeignKey});");
                        }
                        else
                        {
                            sb.AppendLine(";");
                        }
                        break;
                    case "OneToMany":
                        sb.AppendLine($"                entity.HasMany(e => e.{rel.NavigationName})");
                        sb.Append("                    .WithOne(");
                        sb.Append(string.IsNullOrWhiteSpace(inverse) ? ")" : $"d => d.{inverse})");
                        if (hasFk)
                        {
                            sb.AppendLine();
                            sb.AppendLine(
                                $"                    .HasForeignKey(d => d.{rel.ForeignKey});");
                        }
                        else
                        {
                            sb.AppendLine(";");
                        }
                        break;
                    case "OneToOne":
                        sb.AppendLine($"                entity.HasOne<{rel.TargetModel}>(e => e.{rel.NavigationName})");
                        sb.Append("                    .WithOne(");
                        sb.Append(string.IsNullOrWhiteSpace(inverse) ? ")" : $"d => d.{inverse})");
                        if (hasFk)
                        {
                            sb.AppendLine();
                            sb.AppendLine(
                                $"                    .HasForeignKey<{model.ModelName}>(e => e.{rel.ForeignKey});");
                        }
                        else
                        {
                            sb.AppendLine(";");
                        }
                        break;
                    case "ManyToMany":
                        sb.AppendLine($"                entity.HasMany(e => e.{rel.NavigationName})");
                        sb.Append("                    .WithMany(");
                        sb.Append(string.IsNullOrWhiteSpace(inverse) ? ")" : $"d => d.{inverse})");
                        sb.AppendLine(";");
                        break;
                }
            }
            sb.AppendLine("            });");
        }
        sb.AppendLine("        }");
        sb.AppendLine("    }");
        sb.AppendLine("}");
        return sb.ToString();
    }

    public Type? GetModelType(string modelName)
    {
        return _dynamicAssembly.GetTypes()
            .FirstOrDefault(t => t.Name.Equals(modelName, StringComparison.OrdinalIgnoreCase));
    }

    public IEnumerable<Type> GetAllModelTypes()
    {
        return _dynamicAssembly.GetTypes()
            .Where(t => t.IsClass &&
                        t.IsPublic &&
                        !t.IsNested &&
                        t.Namespace == "TheBackend.DynamicModels" &&
                        t != _dynamicDbContextType &&
                        !t.Name.EndsWith("Migration") &&
                        !t.Name.EndsWith("DesignTimeFactory") &&
                        !Attribute.IsDefined(t, typeof(System.Runtime.CompilerServices.CompilerGeneratedAttribute)));
    }

    public DbContext GetDbContext() => CreateDbContextInstance();

    public void Dispose()
    {
        _loadContext?.Unload();
    }
}