using TheBackend.Application.Auth;
using TheBackend.Domain.Models.Auth;

namespace TheBackend.Infrastructure.Auth;

public class InMemoryUserRepository : IUserRepository
{
    private readonly List<AuthUser> _users = new();

    public Task AddAsync(AuthUser user)
    {
        user.Id = _users.Count + 1;
        _users.Add(user);
        return Task.CompletedTask;
    }

    public Task<List<AuthUser>> GetAllAsync()
    {
        return Task.FromResult(_users.ToList());
    }

    public Task<AuthUser?> GetByUserNameAsync(string userName)
    {
        var user = _users.FirstOrDefault(u => u.UserName.Equals(userName, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(user);
    }
}
