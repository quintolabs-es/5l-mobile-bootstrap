namespace __DOTNET_PREFIX__.WebApi;

// Note: ImageBase64 keeps this example simple; for production, prefer multipart/form-data with IFormFile.
public record CreatePostRequest(string Title, string ImageBase64, string? ImageContentType);
