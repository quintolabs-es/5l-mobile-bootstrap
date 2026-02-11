namespace __DOTNET_PREFIX__.WebApi;

public record PublicPostsResponse(string? ViewerUserId, IReadOnlyList<PublicPost> Posts);
