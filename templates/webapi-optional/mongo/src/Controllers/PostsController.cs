using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace __DOTNET_PREFIX__.WebApi;

[ApiController]
public class PostsController : ControllerBase
{
    private readonly IPostsRepository _postsRepository;

    public PostsController(IPostsRepository postsRepository)
    {
        _postsRepository = postsRepository;
    }

    [HttpGet("/posts")]
    [AllowAnonymous]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var posts = await _postsRepository.ListAsync(cancellationToken);
        return Ok(posts);
    }
}

