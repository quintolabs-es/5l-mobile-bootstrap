using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Org.Appname.WebApi;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly AppSettings _settings;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, IOptions<AppSettings> options)
    {
        _next = next;
        _settings = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var logger = context.RequestServices.GetRequiredService<IAppLogger>();
            logger.LogException(ex);

            var statusCode = ex switch
            {
                AppUnauthorizedException => StatusCodes.Status401Unauthorized,
                AppForbiddenException => StatusCodes.Status403Forbidden,
                _ => StatusCodes.Status500InternalServerError
            };

            var message = statusCode switch
            {
                StatusCodes.Status401Unauthorized => "Authentication failed.",
                StatusCodes.Status403Forbidden => "You do not have permission to perform this action.",
                _ => _settings.IsDevelopment ? ex.Message : "An error occurred while processing your request."
            };

            var error = new ErrorResponse(
                message: message,
                statusCode: statusCode,
                traceId: context.TraceIdentifier,
                details: _settings.IsDevelopment ? ex.ToString() : null
            );

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var json = JsonSerializer.Serialize(error, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }
    }
}

