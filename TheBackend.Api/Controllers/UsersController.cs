using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheBackend.Application.Auth;
using TheBackend.Domain.Models.Auth;

namespace TheBackend.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _users;

    public UsersController(IUserRepository users)
    {
        _users = users;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _users.GetAllAsync();
        return Ok(ApiResponse<List<AuthUser>>.Ok(result));
    }
}
