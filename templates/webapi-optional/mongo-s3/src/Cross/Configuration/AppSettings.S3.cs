namespace __DOTNET_PREFIX__.WebApi;

public partial class AppSettings
{
    public S3Settings S3 { get; set; } = new();
}

public class S3Settings
{
    public string ServiceUrl { get; set; } = string.Empty;
    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
}

