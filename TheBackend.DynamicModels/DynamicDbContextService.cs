using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics;
using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using TheBackend.Domain.Models;
using System.Linq;
using System.Collections.Generic;

namespace TheBackend.DynamicModels;

public class DynamicDbContextService : IDisposable
{
    private readonly ModelDefinitionService _modelService;
    private readonly IConfiguration _config;
    private Assembly _dynamicAssembly = default!;
    private Type _dynamicDbContextType = default!;
    private AssemblyLoadContext? _loadContext;
    private readonly List<ServiceProvider> _serviceProviders = new();

    private readonly string ProjectDir;
    private string ModelsDir => Path.Combine(ProjectDir, "Models");
    private string MigrationsDir => Path.Combine(ProjectDir, "Migrations");
    private string DbContextFile => Path.Combine(ProjectDir, "DynamicDbContext.cs");
    private string DesignTimeFactoryFile => Path.Combine(ProjectDir, "DesignTimeFactory.cs");

    public DynamicDbContextService(ModelDefinitionService modelService, IConfiguration config)
    {
        _modelService = modelService;
        _config = config;
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

        foreach (var model in models)
        {
            File.WriteAllText(Path.Combine(ModelsDir, $"{model.ModelName}.cs"), GenerateSingleModelCode(model));
        }
        File.WriteAllText(DbContextFile, GenerateDbContextCode(models));
        File.WriteAllText(DesignTimeFactoryFile, GenerateDesignTimeFactory());

        try
        {
            RunDotnetCommand($"ef migrations add AutoMigration_{DateTime.UtcNow:yyyyMMddHHmmss} --context DynamicDbContext --namespace TheBackend.DynamicModels.Migrations --output-dir Migrations", ProjectDir);
        }
        catch (Exception ex)
        {
            if (!ex.Message.Contains("No migrations were added") && !ex.Message.Contains("The model has not changed"))
                throw;
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
        var useProvider = dbProvider == "SqlServer" ? $"optionsBuilder.UseSqlServer(\"{connString}\");" : $"optionsBuilder.UseNpgsql(\"{connString}\");";
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
            syntaxTrees.Add(CSharpSyntaxTree.ParseText(File.ReadAllText(Path.Combine(ModelsDir, $"{model.ModelName}.cs"))));
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
        string providerAssemblyName = dbProvider == "SqlServer" ? "Microsoft.EntityFrameworkCore.SqlServer" : "Npgsql.EntityFrameworkCore.PostgreSQL";
        var providerAssembly = AppDomain.CurrentDomain.GetAssemblies().FirstOrDefault(a => a.GetName().Name == providerAssemblyName);
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
        var services = new ServiceCollection();
        var connString = _config.GetConnectionString("Default");
        var dbProvider = _config["DbProvider"];

        var addMethod = typeof(EntityFrameworkServiceCollectionExtensions)
            .GetMethods()
            .First(m => m.Name == "AddDbContext" &&
                        m.GetGenericArguments().Length == 1 &&
                        m.GetParameters().Length >= 2 &&
                        m.GetParameters()[1].ParameterType == typeof(Action<DbContextOptionsBuilder>));

        var generic = addMethod.MakeGenericMethod(_dynamicDbContextType);
        object[] args = new object[]
        {
            services,
            (Action<DbContextOptionsBuilder>)(opts =>
            {
                if (dbProvider == "SqlServer")
                    opts.UseSqlServer(connString);
                else if (dbProvider == "Postgres")
                    opts.UseNpgsql(connString);
                else throw new NotSupportedException("Unknown provider");
            }),
            ServiceLifetime.Scoped,
            ServiceLifetime.Scoped
        };

        generic.Invoke(null, args);
        var provider = services.BuildServiceProvider();
        _serviceProviders.Add(provider);
        return (DbContext)provider.GetRequiredService(_dynamicDbContextType);
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
            throw new Exception($"dotnet {arguments} failed:\nOutput:\n{output}\nError:\n{error}\nBuild Output:\n{buildOutput}\nBuild Error:\n{buildError}");
        }
    }

    private string GenerateSingleModelCode(ModelDefinition model, string @namespace = "TheBackend.DynamicModels")
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
        sb.AppendLine("        public DynamicDbContext(DbContextOptions<DynamicDbContext> options) : base(options) {}");
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
                if (prop.IsKey) sb.AppendLine($"                entity.HasKey(e => e.{prop.Name});");
                if (prop.IsRequired) sb.AppendLine($"                entity.Property(e => e.{prop.Name}).IsRequired();");
                if (prop.MaxLength.HasValue) sb.AppendLine($"                entity.Property(e => e.{prop.Name}).HasMaxLength({prop.MaxLength});");
            }
            sb.AppendLine("            });");
        }
        sb.AppendLine("        }");
        sb.AppendLine("    }");
        sb.AppendLine("}");
        return sb.ToString();
    }

    public Type GetModelType(string modelName) =>
        _dynamicAssembly.GetTypes()
            .FirstOrDefault(t => t.Name.Equals(modelName, StringComparison.OrdinalIgnoreCase))
        ?? throw new Exception($"Model '{modelName}' not found");

    public DbContext GetDbContext() => CreateDbContextInstance();

    public void Dispose()
    {
        _loadContext?.Unload();
        foreach (var provider in _serviceProviders)
        {
            provider.Dispose();
        }
        _serviceProviders.Clear();
    }
}