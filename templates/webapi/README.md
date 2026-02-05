# __SLUG__ WebApi

.NET 10 WebApi intended to run in Docker. For deployment examples, see `build-push-img.sh` and `deploy-render.sh`.

## Configuration

### `src/appsettings.json`

- `Auth:JwtIssuer` — JWT issuer used by this API when validating tokens (ex: `https://api.example.com`)
- `Auth:JwtAudience` — JWT audience (ex: `__SLUG__-mobile`)
- `Auth:JwtSigningKey` — JWT signing secret (generate a long random string and keep it private)

### `src/appsettings.[environment].json`

- `Auth:GoogleClientId` — Google OAuth client id used to validate Google `idToken` 
- `Sentry:Dsn` — Sentry DSN. Keep empty in development to disable Sentry.

### Optional infra (only if generated)

- If you generated with `--with-mongo` and/or `--with-s3`, the corresponding config sections are added to `src/appsettings.[environment].json`.
- These features use mocks by default so the API runs without external services. To use the real implementations, fill the config and uncomment the registrations in `src/WebApplicationBuilderExtensions.cs`.

## Run locally

```bash
dotnet restore
dotnet run --project src
```

`dotnet run` defaults to `ASPNETCORE_ENVIRONMENT=development` via `src/Properties/launchSettings.json`.

To run as staging/production locally:

```bash
ASPNETCORE_ENVIRONMENT=staging dotnet run --project src
ASPNETCORE_ENVIRONMENT=production dotnet run --project src
```

## Deploy/build

```bash
docker build -t __SLUG__-webapi:dev .
docker run --rm -p 8080:8080 -e ASPNETCORE_ENVIRONMENT=development __SLUG__-webapi:dev
```

```bash
cp .env.example .env
# edit .env
bash build-push-img.sh
```

Optional (Render example):

```bash
bash deploy-render.sh --env staging
```
