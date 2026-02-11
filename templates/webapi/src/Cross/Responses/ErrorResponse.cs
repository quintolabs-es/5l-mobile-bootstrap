namespace __DOTNET_PREFIX__.WebApi;

public class ErrorResponse
{
    public string Message { get; set; }
    public int StatusCode { get; set; }
    public string TraceId { get; set; }
    public string? Details { get; set; }

    public ErrorResponse(string message, int statusCode, string traceId, string? details = null)
    {
        Message = message;
        StatusCode = statusCode;
        TraceId = traceId;
        Details = details;
    }
}

