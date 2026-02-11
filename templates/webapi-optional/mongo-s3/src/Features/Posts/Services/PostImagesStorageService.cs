using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace __DOTNET_PREFIX__.WebApi;

public interface IPostImagesStorageService
{
    Task<string> SavePostImageAsync(
        string postId,
        byte[] bytes,
        string? contentType = null,
        CancellationToken cancellationToken = default);

    Task CheckConnectionAsync(CancellationToken cancellationToken = default);
}

public class MockPostImagesStorageService : IPostImagesStorageService
{
    public Task<string> SavePostImageAsync(
        string postId,
        byte[] bytes,
        string? contentType = null,
        CancellationToken cancellationToken = default)
    {
        _ = bytes;
        _ = contentType;
        _ = cancellationToken;

        return Task.FromResult($"https://example.invalid/mock-s3/posts/{postId}.jpg");
    }

    public Task CheckConnectionAsync(CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        return Task.CompletedTask;
    }
}

public class S3PostImagesStorageService : IPostImagesStorageService
{
    private readonly AmazonS3Client _client;
    private readonly S3Settings _settings;

    public S3PostImagesStorageService(IOptions<AppSettings> options)
    {
        _settings = options.Value.S3;

        var config = new AmazonS3Config
        {
            ServiceURL = _settings.ServiceUrl,
            ForcePathStyle = true
        };

        _client = new AmazonS3Client(_settings.AccessKeyId, _settings.SecretAccessKey, config);
    }

    public async Task<string> SavePostImageAsync(
        string postId,
        byte[] bytes,
        string? contentType = null,
        CancellationToken cancellationToken = default)
    {
        var key = $"posts/{postId}/{Guid.NewGuid():N}.jpg";

        using var stream = new MemoryStream(bytes);
        var request = new PutObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = key,
            InputStream = stream,
            ContentType = contentType ?? "image/jpeg"
        };

        await _client.PutObjectAsync(request, cancellationToken);

        var publicUrlBase = (_settings.PublicUrl ?? string.Empty).TrimEnd('/');
        return string.IsNullOrWhiteSpace(publicUrlBase)
            ? key
            : $"{publicUrlBase}/{key}";
    }

    public async Task CheckConnectionAsync(CancellationToken cancellationToken = default)
    {
        var request = new GetBucketLocationRequest
        {
            BucketName = _settings.BucketName
        };

        await _client.GetBucketLocationAsync(request, cancellationToken);
    }
}
