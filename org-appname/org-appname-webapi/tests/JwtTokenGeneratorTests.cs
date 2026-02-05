using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Options;
using Xunit;

namespace Org.Appname.WebApi.Tests;

public class JwtTokenGeneratorTests
{
    [Fact]
    public void GenerateTokens_IncludesUserIdInSubClaim()
    {
        var settings = new AppSettings
        {
            Environment = "development",
            Auth = new AuthSettings
            {
                JwtIssuer = "issuer",
                JwtAudience = "audience",
                JwtSigningKey = "01234567890123456789012345678901",
                AccessTokenExpiresAfterHours = 1,
                RefreshTokenExpiresAfterDays = 1
            }
        };

        var gen = new JwtTokenGenerator(Options.Create(settings));
        var user = new User
        {
            Id = "user-1",
            NickName = "Tester",
            AuthProvider = AuthProviders.Google,
            IdInProvider = "ggl-sub"
        };

        (var accessToken, var refreshToken) = gen.GenerateTokens(user);

        var accessJwt = new JwtSecurityTokenHandler().ReadJwtToken(accessToken);
        Assert.Equal(user.Id, accessJwt.Subject);

        var refreshJwt = new JwtSecurityTokenHandler().ReadJwtToken(refreshToken);
        Assert.Equal(user.Id, refreshJwt.Subject);
    }
}

