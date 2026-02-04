namespace __DOTNET_PREFIX__.WebApi;

public partial class AppSettings
{
    public MongoSettings Mongo { get; set; } = new();
}

public class MongoSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
}

