using Microsoft.AspNetCore.Mvc;

namespace Org.Appname.WebApi;

[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet("/health")]
    public IActionResult Get() => Ok(new { ok = true });
}

