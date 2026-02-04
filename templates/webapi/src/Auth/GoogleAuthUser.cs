namespace __DOTNET_PREFIX__.WebApi;

public record GoogleAuthUser
{
    public string IdToken { get; set; } = string.Empty;
    public GoogleUser User { get; set; } = new();
}

public record GoogleUser
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? FamilyName { get; set; }
    public string? GivenName { get; set; }
}

