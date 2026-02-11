namespace __DOTNET_PREFIX__.WebApi;

public class SignInService
{
    private readonly IUsersRepository _usersRepository;
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    public SignInService(IUsersRepository usersRepository, JwtTokenGenerator jwtTokenGenerator)
    {
        _usersRepository = usersRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<LoginModel> RegisterUserIfNotExistAndLoginAsync(User user)
    {
        var registeredUser = await _usersRepository.AddIfNotExistsByIdInProviderAsync(user);
        (var accessToken, var refreshToken) = _jwtTokenGenerator.GenerateTokens(registeredUser);
        return new LoginModel(new TokensModel(accessToken, refreshToken), new UserModel(registeredUser));
    }
}
