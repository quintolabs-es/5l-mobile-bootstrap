using Sentry;

namespace __DOTNET_PREFIX__.WebApi;

public interface IAppLogger
{
    void LogException(Exception ex);
}

public class ConsoleAppLogger : IAppLogger
{
    public void LogException(Exception ex)
    {
        Console.WriteLine($"Exception: {ex}");
    }
}

public class SentryAppLogger : IAppLogger
{
    private readonly IHub _sentry;

    public SentryAppLogger(IHub sentry)
    {
        _sentry = sentry;
    }

    public void LogException(Exception ex)
    {
        _sentry.CaptureException(ex);
    }
}
