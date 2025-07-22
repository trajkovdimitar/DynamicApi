using System.Text.Json;
using System.Net.Http.Json;
using TheBackend.Admin.Shared;

namespace TheBackend.Admin.Shared;

public class ApiClient
{
    private readonly HttpClient _http;
    private string? _token;

    public ApiClient(HttpClient http)
    {
        _http = http;
    }

    public void SetToken(string token)
    {
        _token = token;
        _http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<T?> GetAsync<T>(string uri) where T : class
    {
        var json = await _http.GetStringAsync(uri);
        return DeserializeData<T>(json);
    }

    public async Task<TResponse?> PostAsync<TRequest, TResponse>(string uri, TRequest payload)
        where TResponse : class
    {
        var response = await _http.PostAsJsonAsync(uri, payload);
        var json = await response.Content.ReadAsStringAsync();
        return DeserializeData<TResponse>(json);
    }

    public async Task<TResponse?> PutAsync<TRequest, TResponse>(string uri, TRequest payload)
        where TResponse : class
    {
        var response = await _http.PutAsJsonAsync(uri, payload);
        var json = await response.Content.ReadAsStringAsync();
        return DeserializeData<TResponse>(json);
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
