using Microsoft.AspNetCore.Mvc;

namespace __DOTNET_PREFIX__.WebApi;

[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet("/health")]
    public IActionResult Get() => Ok(new { ok = true });
}

