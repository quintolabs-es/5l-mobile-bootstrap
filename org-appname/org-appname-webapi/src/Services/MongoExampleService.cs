using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Org.Appname.WebApi;

public interface IMongoExampleService
{
    Task<string> PingAsync(CancellationToken cancellationToken = default);
}

public class MockMongoExampleService : IMongoExampleService
{
    public Task<string> PingAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult("mock");
    }
}

public class MongoExampleService : IMongoExampleService
{
    private readonly MongoClient _client;
    private readonly string _databaseName;

    public MongoExampleService(IOptions<AppSettings> options)
    {
        var settings = options.Value.Mongo;
        _client = new MongoClient(settings.ConnectionString);
        _databaseName = settings.DatabaseName;
    }

    public async Task<string> PingAsync(CancellationToken cancellationToken = default)
    {
        var db = _client.GetDatabase(_databaseName);
        await db.RunCommandAsync<BsonDocument>(new BsonDocument("ping", 1), cancellationToken: cancellationToken);
        return "ok";
    }
}

