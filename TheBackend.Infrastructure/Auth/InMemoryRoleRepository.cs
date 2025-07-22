using TheBackend.Application.Auth;
using TheBackend.Domain.Models.Auth;

namespace TheBackend.Infrastructure.Auth;

public class InMemoryRoleRepository : IRoleRepository
{
    private readonly List<AuthRole> _roles = new();

    public Task AddAsync(AuthRole role)
    {
        role.Id = _roles.Count + 1;
        _roles.Add(role);
        return Task.CompletedTask;
    }

    public Task<List<AuthRole>> GetAllAsync()
    {
        return Task.FromResult(_roles.ToList());
    }
}
