using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Org.Appname.WebApi;

public static class CurrentUserExtensions
{
    public static string CurrentUserId(this HttpContext context)
    {
        var id = context.User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new AppUnauthorizedException("Missing user id claim (sub).");
        }
        return id;
    }
}

