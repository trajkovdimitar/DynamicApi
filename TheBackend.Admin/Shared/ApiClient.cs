using System.Text.Json;
using TheBackend.Admin.Shared;

namespace TheBackend.Admin.Shared;

public class ApiClient
{
    private readonly HttpClient _http;

    public ApiClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<T?> GetAsync<T>(string uri) where T : class
    {
        var json = await _http.GetStringAsync(uri);
        return DeserializeData<T>(json);
    }

    private static T? DeserializeData<T>(string json) where T : class
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true 
        };

        try
        {
            var api = JsonSerializer.Deserialize<ApiResponse<T>>(json, options);
            if (api?.Data != null) return api.Data;
        }
        catch
        {
        }

        return JsonSerializer.Deserialize<T>(json, options);
    }

}
