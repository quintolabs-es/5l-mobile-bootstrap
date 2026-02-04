using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace __DOTNET_PREFIX__.WebApi;

[ApiController]
public class PublicPostsController : ControllerBase
{
    [HttpGet("/public/posts")]
    [AllowAnonymous]
    public IActionResult Get()
    {
        // Default ASP.NET Core behavior:
        // - Valid token => HttpContext.User populated
        // - Invalid token => anonymous behavior (no 401 unless challenged)
        var viewerUserId = User.Identity?.IsAuthenticated == true
            ? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            : null;

        var response = new PublicPostsResponse(
            viewerUserId,
            new[]
            {
                new PublicPost("post-1", "Hello world"),
                new PublicPost("post-2", "This is public content")
            }
        );

        return Ok(response);
    }
}

public record PublicPost(string Id, string Title);
public record PublicPostsResponse(string? ViewerUserId, IReadOnlyList<PublicPost> Posts);

