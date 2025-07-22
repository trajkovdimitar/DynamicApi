using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TheBackend.Domain.Models.Auth;

namespace TheBackend.Application.Auth;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly byte[] _key = Encoding.UTF8.GetBytes("supersecretkey12345");

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<string?> AuthenticateAsync(string userName, string password)
    {
        var user = await _userRepository.GetByUserNameAsync(userName);
        if (user == null || user.Password != password) return null;

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName)
        };
        claims.AddRange(user.Roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var creds = new SigningCredentials(new SymmetricSecurityKey(_key), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: "TheBackend",
            audience: "TheBackend",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public TokenValidationParameters GetValidationParameters()
    {
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "TheBackend",
            ValidAudience = "TheBackend",
            IssuerSigningKey = new SymmetricSecurityKey(_key)
        };
    }
}
