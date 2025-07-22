using TheBackend.Domain.Models.Auth;

namespace TheBackend.Application.Auth;

public interface IUserRepository
{
    Task<AuthUser?> GetByUserNameAsync(string userName);
    Task<List<AuthUser>> GetAllAsync();
    Task AddAsync(AuthUser user);
}
