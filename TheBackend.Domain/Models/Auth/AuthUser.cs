using System.Collections.Generic;

namespace TheBackend.Domain.Models.Auth;

public class AuthUser
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
}
