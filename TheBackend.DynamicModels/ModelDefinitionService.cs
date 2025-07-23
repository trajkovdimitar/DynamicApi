using Newtonsoft.Json;
using TheBackend.Domain.Models;
using System.Security.Cryptography;

public class ModelDefinitionService
{
    private readonly string _modelsFilePath;
    private readonly string _migrationsFilePath;
    private readonly string _hashFilePath;

    public ModelDefinitionService(string? modelsPath = null, string? migrationsPath = null, string? hashPath = null)
    {
        _modelsFilePath = modelsPath ?? "models.json";
        _migrationsFilePath = migrationsPath ?? "migrations.json";
        _hashFilePath = hashPath ?? "models.hash";
    }

    public List<ModelDefinition> LoadModels()
    {
        if (!File.Exists(_modelsFilePath)) return new();
        var json = File.ReadAllText(_modelsFilePath);
        return JsonConvert.DeserializeObject<List<ModelDefinition>>(json) ?? new();
    }

    public void SaveModels(List<ModelDefinition> models)
    {
        var json = JsonConvert.SerializeObject(models, Formatting.Indented);
        File.WriteAllText(_modelsFilePath, json);
    }

    public Dictionary<string, string>? LoadMigrationFiles()
    {
        if (!File.Exists(_migrationsFilePath)) return null;
        var json = File.ReadAllText(_migrationsFilePath);
        return JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
    }

    public void SaveMigrationFiles(Dictionary<string, string> migrationFiles)
    {
        var json = JsonConvert.SerializeObject(migrationFiles, Formatting.Indented);
        File.WriteAllText(_migrationsFilePath, json);
    }

    public string ComputeModelsHash()
    {
        if (!File.Exists(_modelsFilePath)) return string.Empty;
        using var sha = SHA256.Create();
        var bytes = File.ReadAllBytes(_modelsFilePath);
        return Convert.ToHexString(sha.ComputeHash(bytes));
    }

    public string? LoadLastModelsHash()
    {
        if (!File.Exists(_hashFilePath)) return null;
        return File.ReadAllText(_hashFilePath);
    }

    public void SaveModelsHash(string hash)
    {
        File.WriteAllText(_hashFilePath, hash);
    }
}
