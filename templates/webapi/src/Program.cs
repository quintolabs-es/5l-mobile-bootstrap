using __DOTNET_PREFIX__.WebApi;
using FastEndpoints;
using FastEndpoints.Swagger;

var builder = WebApplication.CreateBuilder(args);

var settings = builder.InitializeAppSettings();
builder.ConfigureSentry(settings);
builder.RegisterServices(settings);

var app = builder.Build();

app.ConfigureHttpRequestPipeline();
app.UseFastEndpoints();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerGen();
}

app.Run();
