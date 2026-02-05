using Google.Apis.Auth;
using Microsoft.Extensions.Options;

namespace Org.Appname.WebApi;

public class GoogleTokenValidator
{
    private readonly AppSettings _settings;

    public GoogleTokenValidator(IOptions<AppSettings> options)
    {
        _settings = options.Value;
    }

    public async Task<GoogleJsonWebSignature.Payload> ValidateAndGetPayloadAsync(string idToken)
    {
        var validationSettings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = [_settings.Auth.GoogleClientId]
        };

        return await GoogleJsonWebSignature.ValidateAsync(idToken, validationSettings);
    }
}

