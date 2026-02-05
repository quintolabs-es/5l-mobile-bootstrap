using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Org.Appname.WebApi;

public class JwtTokenGenerator
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly string _signingKey;
    private readonly int _accessTokenExpiresAfterHours;
    private readonly int _refreshTokenExpiresAfterDays;

    public JwtTokenGenerator(IOptions<AppSettings> options)
    {
        var settings = options.Value;
        _issuer = settings.Auth.JwtIssuer;
        _audience = settings.Auth.JwtAudience;
        _signingKey = settings.Auth.JwtSigningKey;
        _accessTokenExpiresAfterHours = settings.Auth.AccessTokenExpiresAfterHours;
        _refreshTokenExpiresAfterDays = settings.Auth.RefreshTokenExpiresAfterDays;
    }

    public (string accessToken, string refreshToken) GenerateTokens(User user)
    {
        return (GenerateAccessToken(user), GenerateRefreshToken(user));
    }

    public string GenerateAccessToken(User user)
    {
        var handler = new JsonWebTokenHandler();
        var key = Encoding.ASCII.GetBytes(_signingKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = _issuer,
            Audience = _audience,
            Expires = DateTime.UtcNow.AddHours(_accessTokenExpiresAfterHours),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Name, user.NickName)
            })
        };

        return handler.CreateToken(tokenDescriptor);
    }

    public string GenerateRefreshToken(User user)
    {
        var handler = new JsonWebTokenHandler();
        var key = Encoding.ASCII.GetBytes(_signingKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = _issuer,
            Audience = _audience,
            Expires = DateTime.UtcNow.AddDays(_refreshTokenExpiresAfterDays),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id)
            })
        };

        return handler.CreateToken(tokenDescriptor);
    }
}

