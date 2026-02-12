using FastEndpoints;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using AppUser = __DOTNET_PREFIX__.WebApi.User;

namespace __DOTNET_PREFIX__.WebApi;

public class SignInGoogleEndpoint : Endpoint<GoogleAuthUser, LoginModel>
{
    private readonly GoogleTokenValidator _googleTokenValidator;
    private readonly SignInService _signInService;
    private readonly AppSettings _settings;

    public SignInGoogleEndpoint(
        GoogleTokenValidator googleTokenValidator,
        SignInService signInService,
        IOptions<AppSettings> options)
    {
        _googleTokenValidator = googleTokenValidator;
        _signInService = signInService;
        _settings = options.Value;
    }

    public override void Configure()
    {
        Post("/signin/google");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GoogleAuthUser req, CancellationToken ct)
    {
        try
        {
            var user = _settings.Auth.MockGoogleSignIn
                ? CreateUserFromMock(req.User)
                : await CreateUserFromGooglePayloadAsync(req);
            var loginModel = await _signInService.RegisterUserIfNotExistAndLoginAsync(user);

            await Send.OkAsync(loginModel, ct);
        }
        catch (InvalidJwtException ex)
        {
            throw new AppUnauthorizedException("Invalid Google idToken.", ex);
        }
        catch (Exception ex)
        {
            throw new AppUnauthorizedException("Failed Google sign-in.", ex);
        }
    }

    private async Task<User> CreateUserFromGooglePayloadAsync(GoogleAuthUser req)
    {
        var payload = await _googleTokenValidator.ValidateAndGetPayloadAsync(req.IdToken);
        return AppUser.CreateUserFromGooglePayload(payload, req.User);
    }

    private static User CreateUserFromMock(GoogleUser user)
    {
        var subject = !string.IsNullOrWhiteSpace(user.Id)
            ? user.Id
            : (!string.IsNullOrWhiteSpace(user.Email) ? user.Email : Guid.NewGuid().ToString("N"));

        var nickName = !string.IsNullOrWhiteSpace(user.Name)
            ? user.Name!
            : (!string.IsNullOrWhiteSpace(user.Email) ? user.Email.Split("@")[0] : subject);

        return new User
        {
            Email = user.Email,
            GivenName = user.GivenName,
            FamilyName = user.FamilyName,
            NickName = nickName,
            AuthProvider = AuthProviders.Google,
            IdInProvider = $"ggl-{subject}"
        };
    }
}
