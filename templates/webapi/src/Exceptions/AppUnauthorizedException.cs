namespace __DOTNET_PREFIX__.WebApi;

public class AppUnauthorizedException : Exception
{
    public AppUnauthorizedException(string message) : base(message) { }
    public AppUnauthorizedException(string message, Exception inner) : base(message, inner) { }
}

