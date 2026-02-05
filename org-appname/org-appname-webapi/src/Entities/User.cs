using Google.Apis.Auth;

namespace Org.Appname.WebApi;

public class User
{
    public string Id { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string NickName { get; set; } = string.Empty;
    public string? GivenName { get; set; }
    public string? FamilyName { get; set; }
    public string AuthProvider { get; set; } = string.Empty;
    public string IdInProvider { get; set; } = string.Empty;

    public static User CreateUserFromGooglePayload(GoogleJsonWebSignature.Payload payload, GoogleUser? fallbackUser = null)
    {
        var email = payload.Email ?? fallbackUser?.Email;
        var givenName = payload.GivenName ?? fallbackUser?.GivenName;
        var familyName = payload.FamilyName ?? fallbackUser?.FamilyName;
        var name = payload.Name ?? fallbackUser?.Name;

        return new User
        {
            Email = email,
            GivenName = givenName,
            FamilyName = familyName,
            NickName = !string.IsNullOrWhiteSpace(name)
                ? name
                : (!string.IsNullOrWhiteSpace(email) ? email.Split("@")[0] : payload.Subject),
            AuthProvider = AuthProviders.Google,
            IdInProvider = $"ggl-{payload.Subject}"
        };
    }

    public static User CreateUserFromAppleIdTokenClaims(AppleIdTokenClaims claims, AppleUser? fallbackUser = null)
    {
        var email = claims.Email ?? fallbackUser?.Email;

        return new User
        {
            Email = email,
            GivenName = fallbackUser?.GivenName,
            FamilyName = fallbackUser?.FamilyName,
            NickName = BuildNickNameForApple(claims.Subject, email, fallbackUser),
            AuthProvider = AuthProviders.Apple,
            IdInProvider = $"appl-{claims.Subject}"
        };
    }

    private static string BuildNickNameForApple(string subject, string? email, AppleUser? fallbackUser)
    {
        if (!string.IsNullOrWhiteSpace(fallbackUser?.NickName))
        {
            return fallbackUser.NickName!;
        }
        if (!string.IsNullOrWhiteSpace(fallbackUser?.GivenName))
        {
            return fallbackUser.GivenName!;
        }
        if (!string.IsNullOrWhiteSpace(email))
        {
            return email!.Split("@")[0];
        }
        if (!string.IsNullOrWhiteSpace(fallbackUser?.Email))
        {
            return fallbackUser.Email!.Split("@")[0];
        }
        return subject;
    }
}

