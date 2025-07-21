namespace TheBackend.DynamicModels
{
    // Services/ModelDefinitionService.cs
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.IO;
    using System.Threading.Tasks;

    public class ModelDefinition
    {
        public string ModelName { get; set; }
        public List<PropertyDefinition> Properties { get; set; }
    }

    public class PropertyDefinition
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public bool IsKey { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
    }

    public class ModelDefinitionService
    {
        private const string ModelsFile = "models.json";
        private const string MigrationFilesFile = "migrations.json";

        public async Task<List<ModelDefinition>> LoadModelsAsync()
        {
            if (!File.Exists(ModelsFile)) return new List<ModelDefinition>();
            var json = await File.ReadAllTextAsync(ModelsFile);
            return JsonConvert.DeserializeObject<List<ModelDefinition>>(json);
        }

        public async Task SaveModelsAsync(List<ModelDefinition> models)
        {
            var json = JsonConvert.SerializeObject(models, Formatting.Indented);
            await File.WriteAllTextAsync(ModelsFile, json);
        }

        public async Task<Dictionary<string, string>?> LoadMigrationFilesAsync()
        {
            if (!File.Exists(MigrationFilesFile)) return null;
            var json = await File.ReadAllTextAsync(MigrationFilesFile);
            return JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
        }

        public async Task SaveMigrationFilesAsync(Dictionary<string, string> migrationFiles)
        {
            var json = JsonConvert.SerializeObject(migrationFiles, Formatting.Indented);
            await File.WriteAllTextAsync(MigrationFilesFile, json);
        }
    }
}
