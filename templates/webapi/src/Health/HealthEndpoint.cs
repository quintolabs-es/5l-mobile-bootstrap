using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class HealthEndpoint : EndpointWithoutRequest<object>
{
    public override void Configure()
    {
        Get("/health");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        await SendOkAsync(new { ok = true }, ct);
    }
}
