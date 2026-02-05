using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Org.Appname.WebApi;

[ApiController]
public class SignInController : ControllerBase
{
    private readonly GoogleTokenValidator _googleTokenValidator;
    private readonly AppleTokenValidator _appleTokenValidator;
    private readonly JwtTokenGenerator _jwtTokenGenerator;
    private readonly IUsersStorageService _usersStorageService;

    public SignInController(
        IUsersStorageService usersStorageService,
        GoogleTokenValidator googleTokenValidator,
        AppleTokenValidator appleTokenValidator,
        JwtTokenGenerator jwtTokenGenerator)
    {
        _googleTokenValidator = googleTokenValidator;
        _appleTokenValidator = appleTokenValidator;
        _jwtTokenGenerator = jwtTokenGenerator;
        _usersStorageService = usersStorageService;
    }

    [HttpPost("/signin/google")]
    public async Task<IActionResult> SignInGoogle([FromBody] GoogleAuthUser googleUserCredential)
    {
        try
        {
            var payload = await _googleTokenValidator.ValidateAndGetPayloadAsync(googleUserCredential.IdToken);

            var user = User.CreateUserFromGooglePayload(payload, googleUserCredential.User);
            var loginModel = await RegisterUserIfNotExistAndLoginAsync(user);

            return Ok(loginModel);
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

    [HttpPost("/signin/apple")]
    public async Task<IActionResult> SignInApple([FromBody] AppleAuthUser appleAuthUser)
    {
        try
        {
            var claims = await _appleTokenValidator.ValidateAndGetClaimsAsync(appleAuthUser.IdToken);

            var user = User.CreateUserFromAppleIdTokenClaims(claims, appleAuthUser.User);
            var loginModel = await RegisterUserIfNotExistAndLoginAsync(user);

            return Ok(loginModel);
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

    [HttpPost("/signin/refresh")]
    [Authorize]
    [ValidateRefreshToken]
    public async Task<IActionResult> RefreshToken()
    {
        var currentUser = await _usersStorageService.GetByIdAsync(HttpContext.CurrentUserId());
        if (currentUser == null)
        {
            return Unauthorized("Current user not found.");
        }

        (var accessToken, var refreshToken) = _jwtTokenGenerator.GenerateTokens(currentUser);
        return Ok(new TokensModel(accessToken, refreshToken));
    }

    /* DISABLED: test backdoor endpoint (do not enable in prod)
    [HttpPost("/signin/test/PLACEHOLDER_TEST_SECRET/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> SignInForTest(string userId)
    {
        var currentUser = await _usersStorageService.GetByIdAsync(userId);
        if (currentUser == null)
        {
            return NotFound();
        }

        (var accessToken, var refreshToken) = _jwtTokenGenerator.GenerateTokens(currentUser);
        return Ok(new LoginModel(new TokensModel(accessToken, refreshToken), new UserModel(currentUser)));
    }
    */

    private async Task<LoginModel> RegisterUserIfNotExistAndLoginAsync(User user)
    {
        var registeredUser = await _usersStorageService.AddIfNotExistsByIdInProviderAsync(user);
        (var accessToken, var refreshToken) = _jwtTokenGenerator.GenerateTokens(registeredUser);
        return new LoginModel(new TokensModel(accessToken, refreshToken), new UserModel(registeredUser));
    }
}

