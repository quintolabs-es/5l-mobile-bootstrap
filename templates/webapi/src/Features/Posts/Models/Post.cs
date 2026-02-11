namespace __DOTNET_PREFIX__.WebApi;

public record Post
{
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
