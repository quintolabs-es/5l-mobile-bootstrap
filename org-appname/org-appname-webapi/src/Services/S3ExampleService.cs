using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace Org.Appname.WebApi;

public interface IS3ExampleService
{
    Task<string> CreateExampleReadUrlAsync(string objectKey, TimeSpan expiresIn);
}

public class MockS3ExampleService : IS3ExampleService
{
    public Task<string> CreateExampleReadUrlAsync(string objectKey, TimeSpan expiresIn)
    {
        return Task.FromResult($"https://example.invalid/mock-s3/{Uri.EscapeDataString(objectKey)}");
    }
}

public class S3ExampleService : IS3ExampleService
{
    private readonly AmazonS3Client _client;
    private readonly string _bucketName;

    public S3ExampleService(IOptions<AppSettings> options)
    {
        var settings = options.Value.S3;

        var config = new AmazonS3Config
        {
            ServiceURL = settings.ServiceUrl,
            ForcePathStyle = true
        };

        _client = new AmazonS3Client(settings.AccessKeyId, settings.SecretAccessKey, config);
        _bucketName = settings.BucketName;
    }

    public Task<string> CreateExampleReadUrlAsync(string objectKey, TimeSpan expiresIn)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = objectKey,
            Expires = DateTime.UtcNow.Add(expiresIn),
            Verb = HttpVerb.GET
        };

        var url = _client.GetPreSignedURL(request);
        return Task.FromResult(url);
    }
}

