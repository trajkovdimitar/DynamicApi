using Microsoft.AspNetCore.Mvc;
using TheBackend.Application.Auth;
using TheBackend.Domain.Models.Auth;

namespace TheBackend.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly AuthService _authService;

    public AuthController(IUserRepository users, AuthService authService)
    {
        _users = users;
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthUser request)
    {
        var token = await _authService.AuthenticateAsync(request.UserName, request.Password);
        if (token == null) return Unauthorized(ApiResponse<string>.Fail("Invalid credentials"));
        return Ok(ApiResponse<string>.Ok(token));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthUser user)
    {
        await _users.AddAsync(user);
        return Ok(ApiResponse<AuthUser>.Ok(user));
    }
}
