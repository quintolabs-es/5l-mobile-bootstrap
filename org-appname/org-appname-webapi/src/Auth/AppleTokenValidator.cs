using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Org.Appname.WebApi;

public class AppleTokenValidator
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AppSettings _settings;

    public AppleTokenValidator(IHttpClientFactory httpClientFactory, IOptions<AppSettings> options)
    {
        _httpClientFactory = httpClientFactory;
        _settings = options.Value;
    }

    public async Task<AppleIdTokenClaims> ValidateAndGetClaimsAsync(string idToken)
    {
        try
        {
            var appleKeys = await GetApplePublicKeysAsync();
            var principal = ValidateAppleIdToken(idToken, appleKeys);

            var subject = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrWhiteSpace(subject))
            {
                throw new Exception("Apple idToken missing 'sub' claim.");
            }

            var email =
                principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value ??
                principal.FindFirst(ClaimTypes.Email)?.Value;

            return new AppleIdTokenClaims(subject, email);
        }
        catch (Exception ex)
        {
            throw new InvalidAppleJwtException(ex);
        }
    }

    private async Task<ApplePublicKeys> GetApplePublicKeysAsync()
    {
        try
        {
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetStringAsync(_settings.Auth.Apple.PublicKeysUrl);

            return JsonSerializer.Deserialize<ApplePublicKeys>(
                       response,
                       new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                   ) ??
                   throw new Exception("Failed to parse Apple public keys response.");
        }
        catch (Exception ex)
        {
            throw new UnableToFetchApplePublicKeysException(_settings.Auth.Apple.PublicKeysUrl, ex);
        }
    }

    private ClaimsPrincipal ValidateAppleIdToken(string idToken, ApplePublicKeys applePublicKeys)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(idToken);

        var key = applePublicKeys.Keys.FirstOrDefault(k => k.Kid == jwtToken.Header.Kid);
        if (key == null)
        {
            throw new Exception("Apple public key not found for kid.");
        }

        using var rsa = RSA.Create();
        rsa.ImportParameters(new RSAParameters
        {
            Modulus = Base64UrlEncoder.DecodeBytes(key.N),
            Exponent = Base64UrlEncoder.DecodeBytes(key.E)
        });

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _settings.Auth.Apple.JwtTokenIssuer,
            ValidateAudience = true,
            ValidAudience = _settings.App.MobileAppBundleId,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new RsaSecurityKey(rsa),
            ValidateLifetime = true
        };

        return handler.ValidateToken(idToken, validationParameters, out _);
    }
}

public record AppleIdTokenClaims(string Subject, string? Email);

public class InvalidAppleJwtException : Exception
{
    public InvalidAppleJwtException(Exception inner) : base("Invalid Apple idToken.", inner) { }
}

public class UnableToFetchApplePublicKeysException : Exception
{
    public string PublicKeysUrl { get; }

    public UnableToFetchApplePublicKeysException(string publicKeysUrl, Exception inner)
        : base($"Unable to fetch Apple public keys from '{publicKeysUrl}'.", inner)
    {
        PublicKeysUrl = publicKeysUrl;
    }
}

public class ApplePublicKeys
{
    public ApplePublicKey[] Keys { get; set; } = [];
}

public class ApplePublicKey
{
    public string Kty { get; set; } = string.Empty;
    public string Kid { get; set; } = string.Empty;
    public string Use { get; set; } = string.Empty;
    public string Alg { get; set; } = string.Empty;
    public string N { get; set; } = string.Empty;
    public string E { get; set; } = string.Empty;
}

