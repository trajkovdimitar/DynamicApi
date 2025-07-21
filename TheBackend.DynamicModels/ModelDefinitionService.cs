namespace TheBackend.DynamicModels
{
    // Services/ModelDefinitionService.cs
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.IO;

    using TheBackend.SharedModels;

    public class ModelDefinitionService
    {
        private const string ModelsFile = "models.json";
        private const string MigrationFilesFile = "migrations.json";

        public List<ModelDefinition> LoadModels()
        {
            if (!File.Exists(ModelsFile)) return new List<ModelDefinition>();
            var json = File.ReadAllText(ModelsFile);
            return JsonConvert.DeserializeObject<List<ModelDefinition>>(json);
        }

        public void SaveModels(List<ModelDefinition> models)
        {
            var json = JsonConvert.SerializeObject(models, Formatting.Indented);
            File.WriteAllText(ModelsFile, json);
        }

        public Dictionary<string, string>? LoadMigrationFiles()
        {
            if (!File.Exists(MigrationFilesFile)) return null;
            var json = File.ReadAllText(MigrationFilesFile);
            return JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
        }

        public void SaveMigrationFiles(Dictionary<string, string> migrationFiles)
        {
            var json = JsonConvert.SerializeObject(migrationFiles, Formatting.Indented);
            File.WriteAllText(MigrationFilesFile, json);
        }
    }
}
