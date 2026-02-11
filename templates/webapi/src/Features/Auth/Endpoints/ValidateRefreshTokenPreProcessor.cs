using System.IdentityModel.Tokens.Jwt;
using System.Text;
using FastEndpoints;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace __DOTNET_PREFIX__.WebApi;

public class ValidateRefreshTokenPreProcessor : IPreProcessor<EmptyRequest>
{
    public async Task PreProcessAsync(IPreProcessorContext<EmptyRequest> ctx, CancellationToken ct)
    {
        var refreshTokenModel = await ctx.HttpContext.Request.ReadFromJsonAsync<RefreshTokenModel>(cancellationToken: ct);
        var refreshToken = refreshTokenModel?.RefreshToken;
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            await ctx.HttpContext.Response.SendUnauthorizedAsync(ct);
            return;
        }

        var options = ctx.HttpContext.RequestServices.GetRequiredService<IOptions<AppSettings>>();
        var settings = options.Value;

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
            await ctx.HttpContext.Response.SendUnauthorizedAsync(ct);
        }
    }
}
