using FastEndpoints;

namespace __DOTNET_PREFIX__.WebApi;

public class RefreshTokenEndpoint : EndpointWithoutRequest<TokensModel>
{
    private readonly IUsersStorageService _usersStorageService;
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    public RefreshTokenEndpoint(IUsersStorageService usersStorageService, JwtTokenGenerator jwtTokenGenerator)
    {
        _usersStorageService = usersStorageService;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public override void Configure()
    {
        Post("/signin/refresh");
        PreProcessor<ValidateRefreshTokenPreProcessor>();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var currentUser = await _usersStorageService.GetByIdAsync(HttpContext.CurrentUserId());
        if (currentUser == null)
        {
            await HttpContext.Response.SendAsync("Current user not found.", StatusCodes.Status401Unauthorized, cancellation: ct);
            return;
        }

        (var accessToken, var refreshToken) = _jwtTokenGenerator.GenerateTokens(currentUser);
        await SendOkAsync(new TokensModel(accessToken, refreshToken), ct);
    }
}
