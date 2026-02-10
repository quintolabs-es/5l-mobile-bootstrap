using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace __DOTNET_PREFIX__.WebApi;

[ApiController]
public class PostsWriteController : ControllerBase
{
    private readonly IPostsRepository _postsRepository;
    private readonly IPostImagesStorageService _postImagesStorageService;

    public PostsWriteController(IPostsRepository postsRepository, IPostImagesStorageService postImagesStorageService)
    {
        _postsRepository = postsRepository;
        _postImagesStorageService = postImagesStorageService;
    }

    [HttpPost("/posts")]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreatePostRequest request, CancellationToken cancellationToken)
    {
        var base64 = request.ImageBase64.Trim();
        var base64PrefixIndex = base64.IndexOf("base64,", StringComparison.OrdinalIgnoreCase);
        if (base64PrefixIndex >= 0) base64 = base64[(base64PrefixIndex + "base64,".Length)..];

        var bytes = Convert.FromBase64String(base64);

        var post = new Post
        {
            Id = Guid.NewGuid().ToString("N"),
            Title = request.Title.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        post.ImageUrl = await _postImagesStorageService.SavePostImageAsync(
            post.Id,
            bytes,
            request.ImageContentType,
            cancellationToken);

        await _postsRepository.CreateAsync(post, cancellationToken);

        return Created($"/posts/{post.Id}", post);
    }
}

// Note: ImageBase64 keeps this example simple; for production, prefer multipart/form-data with IFormFile.
public record CreatePostRequest(string Title, string ImageBase64, string? ImageContentType);
