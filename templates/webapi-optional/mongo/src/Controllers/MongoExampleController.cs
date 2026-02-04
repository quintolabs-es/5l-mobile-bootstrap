using Microsoft.AspNetCore.Mvc;

namespace __DOTNET_PREFIX__.WebApi;

[ApiController]
public class MongoExampleController : ControllerBase
{
    private readonly IMongoExampleService _mongo;

    public MongoExampleController(IMongoExampleService mongo)
    {
        _mongo = mongo;
    }

    [HttpGet("/infra/mongo/ping")]
    public async Task<IActionResult> Ping(CancellationToken cancellationToken)
    {
        var result = await _mongo.PingAsync(cancellationToken);
        return Ok(new { ok = true, result });
    }
}

