using FastEndpoints;
using Microsoft.Extensions.Options;

namespace __DOTNET_PREFIX__.WebApi;

public class HealthEndpoint : EndpointWithoutRequest<object>
{
    private readonly AppSettings _settings;

    public HealthEndpoint(IOptions<AppSettings> options)
    {
        _settings = options.Value;
    }

    public override void Configure()
    {
        Get("/health");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        await Send.OkAsync(new
        {
            Status = "healthy",
            Environment = _settings.Environment,
            UtcTimestamp = DateTime.UtcNow
        }, ct);
    }
}
