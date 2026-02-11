using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class CreatePostEndpoint : Endpoint<CreatePostRequest, Post>
{
    private readonly IPostsRepository _postsRepository;
    private readonly IPostImagesStorageService _postImagesStorageService;

    public CreatePostEndpoint(IPostsRepository postsRepository, IPostImagesStorageService postImagesStorageService)
    {
        _postsRepository = postsRepository;
        _postImagesStorageService = postImagesStorageService;
    }

    public override void Configure()
    {
        Post("/posts");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CreatePostRequest req, CancellationToken ct)
    {
        var base64 = req.ImageBase64.Trim();
        var base64PrefixIndex = base64.IndexOf("base64,", StringComparison.OrdinalIgnoreCase);
        if (base64PrefixIndex >= 0) base64 = base64[(base64PrefixIndex + "base64,".Length)..];

        var bytes = Convert.FromBase64String(base64);

        var post = new Post
        {
            Id = Guid.NewGuid().ToString("N"),
            Title = req.Title.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        post.ImageUrl = await _postImagesStorageService.SavePostImageAsync(
            post.Id,
            bytes,
            req.ImageContentType,
            ct);

        await _postsRepository.CreateAsync(post, ct);

        HttpContext.Response.Headers.Location = $"/posts/{post.Id}";
        await SendAsync(post, StatusCodes.Status201Created, cancellation: ct);
    }
}
