using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace __DOTNET_PREFIX__.WebApi;

public class ValidateRefreshToken : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var options = context.HttpContext.RequestServices.GetRequiredService<IOptions<AppSettings>>();
        var settings = options.Value;

        var refreshTokenModel = await context.HttpContext.Request.ReadFromJsonAsync<RefreshTokenModel>();
        var refreshToken = refreshTokenModel?.RefreshToken;

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(settings.Auth.JwtSigningKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidIssuer = settings.Auth.JwtIssuer,
                ValidAudience = settings.Auth.JwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true
            };

            handler.ValidateToken(refreshToken, validationParameters, out _);
        }
        catch
        {
            context.Result = new UnauthorizedResult();
        }
    }
}

