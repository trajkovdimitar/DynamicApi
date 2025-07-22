using System.Text;
using System.Text.Json;
using TheBackend.Domain.Models;
using TheBackend.Admin.Shared;

namespace TheBackend.Admin.Services;

public class CollectionService
{
    private readonly HttpClient _http;
    private readonly ApiClient _api;

    public CollectionService(HttpClient http, ApiClient api)
    {
        _http = http;
        _api = api;
    }

    public async Task<List<ModelDefinition>> GetDefinitionsAsync()
    {
        return await _api.GetAsync<List<ModelDefinition>>("api/models") ?? new();
    }

    public async Task<ModelDefinition?> GetDefinitionAsync(string name)
    {
        var defs = await GetDefinitionsAsync();
        return defs.FirstOrDefault(m => m.ModelName.Equals(name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<List<Dictionary<string, object>>> GetRecordsAsync(string name)
    {
        var json = await _http.GetStringAsync($"api/{name}");
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.EnumerateArray()
            .Select(e => e.EnumerateObject().ToDictionary(p => p.Name, p => (object)p.Value.ToString()))
            .ToList();
    }

    public async Task CreateAsync(string name, Dictionary<string, object> record)
    {
        var json = JsonSerializer.Serialize(record);
        await _http.PostAsync($"api/{name}", new StringContent(json, Encoding.UTF8, "application/json"));
    }

    public async Task UpdateAsync(string name, object id, Dictionary<string, object> record)
    {
        var json = JsonSerializer.Serialize(record);
        await _http.PutAsync($"api/{name}/{id}", new StringContent(json, Encoding.UTF8, "application/json"));
    }

    public async Task DeleteAsync(string name, object id)
    {
        await _http.DeleteAsync($"api/{name}/{id}");
    }
}
