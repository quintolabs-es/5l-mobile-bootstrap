using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class RefreshTokenEndpoint : EndpointWithoutRequest<TokensModel>
{
    private readonly IUsersRepository _usersRepository;
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    public RefreshTokenEndpoint(IUsersRepository usersRepository, JwtTokenGenerator jwtTokenGenerator)
    {
        _usersRepository = usersRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public override void Configure()
    {
        Post("/signin/refresh");
        PreProcessor<ValidateRefreshTokenPreProcessor>();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var currentUser = await _usersRepository.GetByIdAsync(HttpContext.CurrentUserId());
        if (currentUser == null)
        {
            await HttpContext.Response.SendAsync("Current user not found.", StatusCodes.Status401Unauthorized, cancellation: ct);
            return;
        }

        (var accessToken, var refreshToken) = _jwtTokenGenerator.GenerateTokens(currentUser);
        await Send.OkAsync(new TokensModel(accessToken, refreshToken), ct);
    }
}
