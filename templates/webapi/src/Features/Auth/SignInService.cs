namespace __DOTNET_PREFIX__.WebApi;

public class SignInService
{
    private readonly IUsersStorageService _usersStorageService;
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    public SignInService(IUsersStorageService usersStorageService, JwtTokenGenerator jwtTokenGenerator)
    {
        _usersStorageService = usersStorageService;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<LoginModel> RegisterUserIfNotExistAndLoginAsync(User user)
    {
        var registeredUser = await _usersStorageService.AddIfNotExistsByIdInProviderAsync(user);
        (var accessToken, var refreshToken) = _jwtTokenGenerator.GenerateTokens(registeredUser);
        return new LoginModel(new TokensModel(accessToken, refreshToken), new UserModel(registeredUser));
    }
}
