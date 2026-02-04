namespace __DOTNET_PREFIX__.WebApi;

public class UserModel
{
    public UserModel(User user)
    {
        Id = user.Id;
        Email = user.Email;
        NickName = user.NickName;
        GivenName = user.GivenName;
        FamilyName = user.FamilyName;
        AuthProvider = user.AuthProvider;
        IdInProvider = user.IdInProvider;
    }

    public string Id { get; set; }
    public string? Email { get; set; }
    public string NickName { get; set; }
    public string? GivenName { get; set; }
    public string? FamilyName { get; set; }
    public string AuthProvider { get; set; }
    public string IdInProvider { get; set; }
}

