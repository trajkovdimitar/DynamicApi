using Newtonsoft.Json;
using TheBackend.Domain.Models;

public class ModelDefinitionService
{
    private readonly string _modelsFilePath;
    private readonly string _migrationsFilePath;

    public ModelDefinitionService(string? modelsPath = null, string? migrationsPath = null)
    {
        _modelsFilePath = modelsPath ?? "models.json";
        _migrationsFilePath = migrationsPath ?? "migrations.json";
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
}
