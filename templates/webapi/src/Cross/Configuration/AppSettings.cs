namespace __DOTNET_PREFIX__.WebApi;

public partial class AppSettings
{
    public string Environment { get; set; } = string.Empty;
    public AppInfo App { get; set; } = new();
    public AuthSettings Auth { get; set; } = new();
    public SentrySettings Sentry { get; set; } = new();

    public bool IsDevelopment => Environment == "development";
    public bool IsStaging => Environment == "staging";
    public bool IsProduction => Environment == "production";
}

public class AppInfo
{
    public string MobileAppBundleId { get; set; } = string.Empty;
    public string AppScheme { get; set; } = string.Empty;
}

public class AuthSettings
{
    public string GoogleClientId { get; set; } = string.Empty;
    public string JwtIssuer { get; set; } = string.Empty;
    public string JwtAudience { get; set; } = string.Empty;
    public string JwtSigningKey { get; set; } = string.Empty;
    public int AccessTokenExpiresAfterHours { get; set; } = 168; // one week
    public int RefreshTokenExpiresAfterDays { get; set; } = 60; // two months
    public AppleAuthSettings Apple { get; set; } = new();
}

public class AppleAuthSettings
{
    public string PublicKeysUrl { get; set; } = "https://appleid.apple.com/auth/keys";
    public string JwtTokenIssuer { get; set; } = "https://appleid.apple.com";
}

public class SentrySettings
{
    public string Dsn { get; set; } = string.Empty;
}
