using TheBackend.Domain.Models.Auth;

namespace TheBackend.Application.Auth;

public interface IRoleRepository
{
    Task<List<AuthRole>> GetAllAsync();
    Task AddAsync(AuthRole role);
}
