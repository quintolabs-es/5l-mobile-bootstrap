namespace __DOTNET_PREFIX__.WebApi;

public class TokensModel
{
    public TokensModel(string accessToken, string refreshToken)
    {
        AccessToken = accessToken;
        RefreshToken = refreshToken;
    }

    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
}

