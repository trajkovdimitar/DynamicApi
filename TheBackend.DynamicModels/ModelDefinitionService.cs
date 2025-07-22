namespace TheBackend.DynamicModels
{
    // Services/ModelDefinitionService.cs
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.IO;
    using TheBackend.Domain.Models;

    public class ModelDefinitionService
    {
        private const string ModelsFile = "models.json";
        private const string MigrationFilesFile = "migrations.json";
        private static readonly HashSet<string> AllowedTypes = new(
            new[]
            {
                "bool",
                "byte",
                "short",
                "int",
                "long",
                "float",
                "double",
                "decimal",
                "string",
                "char",
                "DateTime",
                "Guid"
            },
            StringComparer.OrdinalIgnoreCase);

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

        public void ValidateModel(ModelDefinition model)
        {
            foreach (var prop in model.Properties)
            {
                if (string.IsNullOrWhiteSpace(prop.Type) || !AllowedTypes.Contains(prop.Type))
                {
                    throw new InvalidOperationException(
                        $"Property '{prop.Name}' has unsupported type '{prop.Type}'. Allowed types: {string.Join(", ", AllowedTypes)}");
                }
            }
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
