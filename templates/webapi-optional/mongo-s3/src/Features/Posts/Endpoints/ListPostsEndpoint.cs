using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class ListPostsEndpoint : EndpointWithoutRequest<IReadOnlyList<Post>>
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
        var posts = await _postsRepository.ListAsync(ct);
        await Send.OkAsync(posts, ct);
    }
}
