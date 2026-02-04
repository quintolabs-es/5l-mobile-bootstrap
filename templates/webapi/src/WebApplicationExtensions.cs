namespace __DOTNET_PREFIX__.WebApi;

public static class WebApplicationExtensions
{
    public static void ConfigureHttpRequestPipeline(this WebApplication app)
    {
        app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors(builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());

        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        app.UseAuthentication();
        app.UseAuthorization();
    }
}

