using Microsoft.AspNetCore.Mvc;

namespace __DOTNET_PREFIX__.WebApi;

[ApiController]
public class S3ExampleController : ControllerBase
{
    private readonly IS3ExampleService _s3;

    public S3ExampleController(IS3ExampleService s3)
    {
        _s3 = s3;
    }

    [HttpGet("/infra/s3/presign-read")]
    public async Task<IActionResult> PresignRead([FromQuery] string key = "example.txt", CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        var url = await _s3.CreateExampleReadUrlAsync(key, TimeSpan.FromMinutes(15));
        return Ok(new { ok = true, key, url });
    }
}

