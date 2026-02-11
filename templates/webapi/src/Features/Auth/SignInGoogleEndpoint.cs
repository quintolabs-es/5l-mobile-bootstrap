using FastEndpoints;
using Google.Apis.Auth;
using AppUser = __DOTNET_PREFIX__.WebApi.User;

namespace __DOTNET_PREFIX__.WebApi;

public class SignInGoogleEndpoint : Endpoint<GoogleAuthUser, LoginModel>
{
    private readonly GoogleTokenValidator _googleTokenValidator;
    private readonly SignInService _signInService;

    public SignInGoogleEndpoint(GoogleTokenValidator googleTokenValidator, SignInService signInService)
    {
        _googleTokenValidator = googleTokenValidator;
        _signInService = signInService;
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
            var payload = await _googleTokenValidator.ValidateAndGetPayloadAsync(req.IdToken);
            var user = AppUser.CreateUserFromGooglePayload(payload, req.User);
            var loginModel = await _signInService.RegisterUserIfNotExistAndLoginAsync(user);

            await SendOkAsync(loginModel, ct);
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
}
