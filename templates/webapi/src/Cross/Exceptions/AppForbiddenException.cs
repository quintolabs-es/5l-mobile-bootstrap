namespace __DOTNET_PREFIX__.WebApi;

public class AppForbiddenException : Exception
{
    public AppForbiddenException(string message) : base(message) { }
    public AppForbiddenException(string message, Exception inner) : base(message, inner) { }
}

