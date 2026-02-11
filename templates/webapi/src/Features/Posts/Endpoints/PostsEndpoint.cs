using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class PostsEndpoint : EndpointWithoutRequest<PostsResponse>
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

        var response = new PostsResponse(
            viewerUserId,
            new List<Post>
            {
                new() { Id = "post-1", Title = "Hello world", CreatedAtUtc = DateTime.UtcNow.AddMinutes(-10) },
                new() { Id = "post-2", Title = "This is public content", CreatedAtUtc = DateTime.UtcNow.AddMinutes(-5) }
            }
        );

        await Send.OkAsync(response, ct);
    }
}
