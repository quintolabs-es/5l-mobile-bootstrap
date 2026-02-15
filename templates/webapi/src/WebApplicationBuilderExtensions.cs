using System.Text;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Sentry.AspNetCore;

namespace __DOTNET_PREFIX__.WebApi;

public static class WebApplicationBuilderExtensions
{
    public static AppSettings InitializeAppSettings(this WebApplicationBuilder builder)
    {
        var aspnetEnvironment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (string.IsNullOrWhiteSpace(aspnetEnvironment))
        {
            throw new InvalidOperationException(
                "ASPNETCORE_ENVIRONMENT is required. Set it to \"development\", \"staging\", or \"production\".");
        }

        builder.Services.Configure<AppSettings>(builder.Configuration);

        var settings = builder.Configuration.Get<AppSettings>()
            ?? throw new InvalidOperationException("Failed to bind AppSettings from configuration.");

        settings.EnableGoogleSignInEndpointInDev = GetBooleanFromEnv(
            "ENABLE_GOOGLE_SIGN_IN_ENDPOINT_IN_DEV",
            settings.EnableGoogleSignInEndpointInDev);

        return settings;
    }

    public static void ConfigureSentry(this WebApplicationBuilder builder, AppSettings settings)
    {
        if (settings.IsDevelopment)
        {
            return;
        }

        builder.WebHost.UseSentry(o =>
        {
            o.Dsn = settings.Sentry.Dsn;
            o.Environment = settings.Environment;
            o.SendDefaultPii = true;
        });
    }

    public static void RegisterServices(this WebApplicationBuilder builder, AppSettings settings)
    {
        builder.Services.AddCors();
        builder.Services.AddFastEndpoints();
        builder.Services.SwaggerDocument();
        builder.Services.AddAuthorization();

        builder.Services.AddAuthentication(options =>
            {
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = settings.Auth.JwtIssuer,
                    ValidAudience = settings.Auth.JwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Auth.JwtSigningKey)),
                    NameClaimType = JwtRegisteredClaimNames.Name
                };
            });

        builder.Services.RegisterWebApiServices(settings);
    }

    private static void RegisterWebApiServices(this IServiceCollection services, AppSettings settings)
    {
        services.AddHttpClient();

        if (settings.IsDevelopment)
            services.AddSingleton<IAppLogger, ConsoleAppLogger>();
        else
            services.AddSingleton<IAppLogger, SentryAppLogger>();

        services.AddSingleton<JwtTokenGenerator>();
        services.AddSingleton<GoogleTokenValidator>();
        services.AddSingleton<AppleTokenValidator>();
        services.AddSingleton<SignInService>();

        services.AddSingleton<IUsersRepository, InMemoryUsersRepository>();

        // __WITH_MONGO_SERVICES__
        // __WITH_S3_SERVICES__
    }

    private static bool GetBooleanFromEnv(string name, bool fallback)
    {
        var raw = Environment.GetEnvironmentVariable(name);
        if (string.IsNullOrWhiteSpace(raw))
        {
            return fallback;
        }

        if (bool.TryParse(raw, out var parsed))
        {
            return parsed;
        }

        return raw.Trim() switch
        {
            "1" => true,
            "0" => false,
            _ => fallback
        };
    }
}
