namespace Org.Appname.WebApi;

public record AppleAuthUser
{
    public string IdToken { get; set; } = string.Empty;
    public AppleUser User { get; set; } = new();
}

public record AppleUser
{
    public string Id { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? NickName { get; set; }
    public string? FamilyName { get; set; }
    public string? GivenName { get; set; }
}

