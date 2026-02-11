using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class ListPostsEndpoint : EndpointWithoutRequest<PostsResponse>
{
    private readonly IPostsRepository _postsRepository;

    public ListPostsEndpoint(IPostsRepository postsRepository)
    {
        _postsRepository = postsRepository;
    }

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

        var posts = await _postsRepository.ListAsync(ct);

        var response = new PostsResponse(viewerUserId, posts);

        await Send.OkAsync(response, ct);
    }
}
