namespace __DOTNET_PREFIX__.WebApi;

public record PostsResponse(string? ViewerUserId, IReadOnlyList<Post> Posts);
