using FastEndpoints;
using Microsoft.Extensions.Options;

namespace __DOTNET_PREFIX__.WebApi;

public class HealthEndpoint : EndpointWithoutRequest<object>
{
    private readonly IPostsRepository _postsRepository;
    private readonly IPostImagesStorageService _postImagesStorageService;
    private readonly AppSettings _settings;

    public HealthEndpoint(
        IPostsRepository postsRepository,
        IPostImagesStorageService postImagesStorageService,
        IOptions<AppSettings> options)
    {
        _postsRepository = postsRepository;
        _postImagesStorageService = postImagesStorageService;
        _settings = options.Value;
    }

    public override void Configure()
    {
        Get("/health");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var dbCheck = await CheckDatabaseAsync(ct);
        var storageCheck = await CheckStorageAsync(ct);

        var health = new
        {
            Status = "healthy",
            Environment = _settings.Environment,
            UtcTimestamp = DateTime.UtcNow,
            Checks = new
            {
                Database = dbCheck,
                Storage = storageCheck
            }
        };

        var allHealthy = dbCheck.Healthy && storageCheck.Healthy;
        var statusCode = allHealthy
            ? StatusCodes.Status200OK
            : StatusCodes.Status503ServiceUnavailable;

        await Send.ResultAsync(Results.Json(health, statusCode: statusCode));
    }

    private async Task<HealthCheckResult> CheckDatabaseAsync(CancellationToken ct)
    {
        try
        {
            await _postsRepository.ListAsync(ct);
            return new HealthCheckResult(true, "Connected");
        }
        catch (Exception ex)
        {
            return new HealthCheckResult(false, ex.ToString());
        }
    }

    private async Task<HealthCheckResult> CheckStorageAsync(CancellationToken ct)
    {
        try
        {
            await _postImagesStorageService.CheckConnectionAsync(ct);
            return new HealthCheckResult(true, "Connected");
        }
        catch (Exception ex)
        {
            return new HealthCheckResult(false, ex.ToString());
        }
    }

    private record HealthCheckResult(bool Healthy, string Message);
}
