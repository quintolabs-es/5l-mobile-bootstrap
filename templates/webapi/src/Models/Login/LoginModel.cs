namespace __DOTNET_PREFIX__.WebApi;

public record LoginModel
{
    public LoginModel(TokensModel tokens, UserModel user)
    {
        Tokens = tokens ?? throw new ArgumentNullException(nameof(tokens));
        User = user ?? throw new ArgumentNullException(nameof(user));
    }

    public TokensModel Tokens { get; set; }
    public UserModel User { get; set; }
}

