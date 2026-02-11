using FastEndpoints;
using AppUser = __DOTNET_PREFIX__.WebApi.User;

namespace __DOTNET_PREFIX__.WebApi;

public class SignInAppleEndpoint : Endpoint<AppleAuthUser, LoginModel>
{
    private readonly AppleTokenValidator _appleTokenValidator;
    private readonly SignInService _signInService;

    public SignInAppleEndpoint(AppleTokenValidator appleTokenValidator, SignInService signInService)
    {
        _appleTokenValidator = appleTokenValidator;
        _signInService = signInService;
    }

    public override void Configure()
    {
        Post("/signin/apple");
        AllowAnonymous();
    }

    public override async Task HandleAsync(AppleAuthUser req, CancellationToken ct)
    {
        try
        {
            var claims = await _appleTokenValidator.ValidateAndGetClaimsAsync(req.IdToken);
            var user = AppUser.CreateUserFromAppleIdTokenClaims(claims, req.User);
            var loginModel = await _signInService.RegisterUserIfNotExistAndLoginAsync(user);

            await Send.OkAsync(loginModel, ct);
        }
        catch (InvalidAppleJwtException ex)
        {
            throw new AppUnauthorizedException("Invalid Apple idToken.", ex);
        }
        catch (Exception ex)
        {
            throw new AppUnauthorizedException("Failed Apple sign-in.", ex);
        }
    }
}
