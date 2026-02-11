using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class GetMyProfileEndpoint : EndpointWithoutRequest<UserModel>
{
    private readonly IUsersRepository _usersRepository;

    public GetMyProfileEndpoint(IUsersRepository usersRepository)
    {
        _usersRepository = usersRepository;
    }

    public override void Configure()
    {
        Get("/users/me");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var currentUser = await _usersRepository.GetByIdAsync(HttpContext.CurrentUserId());
        if (currentUser == null)
        {
            await HttpContext.Response.SendAsync("Current user not found.", StatusCodes.Status401Unauthorized, cancellation: ct);
            return;
        }

        await Send.OkAsync(new UserModel(currentUser), ct);
    }
}
