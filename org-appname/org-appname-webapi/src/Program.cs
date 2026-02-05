using Org.Appname.WebApi;

var builder = WebApplication.CreateBuilder(args);

var settings = builder.InitializeAppSettings();
builder.ConfigureSentry(settings);
builder.RegisterServices(settings);

var app = builder.Build();

app.ConfigureHttpRequestPipeline();
app.MapControllers();

app.Run();

