using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using TheBackend.Admin;
using TheBackend.Admin.Shared;
using TheBackend.Admin.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri("https://localhost:7020/") });
builder.Services.AddScoped<ApiClient>();
builder.Services.AddScoped<CollectionService>();

await builder.Build().RunAsync();
