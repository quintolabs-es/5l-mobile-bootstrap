namespace __DOTNET_PREFIX__.WebApi;

public interface IUsersRepository
{
    Task<User?> GetByIdAsync(string userId);
    Task<User> AddIfNotExistsByIdInProviderAsync(User user);
}

public class InMemoryUsersRepository : IUsersRepository
{
    private readonly object _lock = new();
    private readonly Dictionary<string, User> _byId = new();
    private readonly Dictionary<string, string> _userIdByIdInProvider = new();

    public Task<User?> GetByIdAsync(string userId)
    {
        lock (_lock)
        {
            _byId.TryGetValue(userId, out var user);
            return Task.FromResult(user);
        }
    }

    public Task<User> AddIfNotExistsByIdInProviderAsync(User user)
    {
        lock (_lock)
        {
            if (_userIdByIdInProvider.TryGetValue(user.IdInProvider, out var existingUserId) &&
                _byId.TryGetValue(existingUserId, out var existing))
            {
                return Task.FromResult(existing);
            }

            user.Id = Guid.NewGuid().ToString("N");
            _byId[user.Id] = user;
            _userIdByIdInProvider[user.IdInProvider] = user.Id;
            return Task.FromResult(user);
        }
    }
}
