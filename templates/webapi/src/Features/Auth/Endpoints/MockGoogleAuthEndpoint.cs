using FastEndpoints;
using Microsoft.Extensions.Options;

namespace __DOTNET_PREFIX__.WebApi;

public class MockGoogleAuthEndpoint : EndpointWithoutRequest<LoginModel>
{
    private readonly SignInService _signInService;
    private readonly AppSettings _settings;

    public MockGoogleAuthEndpoint(SignInService signInService, IOptions<AppSettings> options)
    {
        _signInService = signInService;
        _settings = options.Value;
    }

    public override void Configure()
    {
        Post("/mock/auth/google");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!_settings.IsDevelopment || !_settings.EnableGoogleSignInEndpointInDev)
        {
            await Send.ResultAsync(Results.NotFound());
            return;
        }

        var user = new User
        {
            Email = "mock.google@example.com",
            GivenName = "Mock",
            FamilyName = "User",
            NickName = "Mock Google",
            AuthProvider = AuthProviders.Google,
            IdInProvider = "ggl-mock-google-user"
        };

        var loginModel = await _signInService.RegisterUserIfNotExistAndLoginAsync(user);
        await Send.OkAsync(loginModel, ct);
    }
}
