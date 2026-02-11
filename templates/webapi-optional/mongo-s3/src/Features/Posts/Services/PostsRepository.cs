using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace __DOTNET_PREFIX__.WebApi;

public interface IPostsRepository
{
    Task<IReadOnlyList<Post>> ListAsync(CancellationToken cancellationToken = default);
    Task<Post> CreateAsync(Post post, CancellationToken cancellationToken = default);
}

public class MockPostsRepository : IPostsRepository
{
    private readonly object _lock = new();
    private readonly List<Post> _posts =
    [
        new Post
        {
            Id = "post-1",
            Title = "Raynow: hello world",
            ImageUrl = "https://example.invalid/mock-s3/posts/post-1.jpg",
            CreatedAtUtc = DateTime.UtcNow.AddMinutes(-10)
        },
        new Post
        {
            Id = "post-2",
            Title = "Raynow: this is mock content",
            ImageUrl = "https://example.invalid/mock-s3/posts/post-2.jpg",
            CreatedAtUtc = DateTime.UtcNow.AddMinutes(-5)
        }
    ];

    public Task<IReadOnlyList<Post>> ListAsync(CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;

        lock (_lock)
        {
            var ordered = _posts
                .OrderByDescending(p => p.CreatedAtUtc)
                .ToList();

            return Task.FromResult((IReadOnlyList<Post>)ordered);
        }
    }

    public Task<Post> CreateAsync(Post post, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;

        lock (_lock)
        {
            if (string.IsNullOrWhiteSpace(post.Id))
            {
                post.Id = Guid.NewGuid().ToString("N");
            }

            if (post.CreatedAtUtc == default)
            {
                post.CreatedAtUtc = DateTime.UtcNow;
            }

            _posts.Add(post);
            return Task.FromResult(post);
        }
    }
}

public class MongoPostsRepository : IPostsRepository
{
    private readonly IMongoCollection<Post> _postsCollection;

    public MongoPostsRepository(IOptions<AppSettings> options)
    {
        var settings = options.Value.Mongo;
        var client = new MongoClient(settings.ConnectionString);
        var db = client.GetDatabase(settings.DatabaseName);
        _postsCollection = db.GetCollection<Post>("posts");
    }

    public async Task<IReadOnlyList<Post>> ListAsync(CancellationToken cancellationToken = default)
    {
        var posts = await _postsCollection
            .Find(FilterDefinition<Post>.Empty)
            .SortByDescending(p => p.CreatedAtUtc)
            .Limit(50)
            .ToListAsync(cancellationToken);

        return posts;
    }

    public async Task<Post> CreateAsync(Post post, CancellationToken cancellationToken = default)
    {
        await _postsCollection.InsertOneAsync(post, cancellationToken: cancellationToken);
        return post;
    }
}

