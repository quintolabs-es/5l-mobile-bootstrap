using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class PostsEndpoint : EndpointWithoutRequest<PublicPostsResponse>
{
    public override void Configure()
    {
        Get("/posts");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
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

        await Send.OkAsync(response, ct);
    }
}
