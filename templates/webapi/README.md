# __APP_ID__ WebApi

.NET 10 WebApi intended to run in Docker. For deployment examples, see `build-push-img.sh` and `deploy-render.sh`.

## Configuration
### Environment

The environment is set via `ASPNETCORE_ENVIRONMENT` (values: `development`, `staging`, `production`).
This template requires it to be set; if missing, the app throws on startup. `dotnet run` uses `development` via `src/Properties/launchSettings.json`.
The app loads `appsettings.json` plus `appsettings.{environment}.json`.

### `src/appsettings.json`

- `Auth:JwtIssuer` — JWT issuer used by this API when validating tokens (ex: `https://api.example.com`)
- `Auth:JwtAudience` — JWT audience (ex: `__SLUG__`)
- `Auth:JwtSigningKey` — JWT signing secret (generate a long random string and keep it private)

### `src/appsettings.[environment].json`

- `Auth:GoogleClientId` — Google OAuth client id used to validate Google `idToken` 
- `Auth:MockGoogleSignIn` — Optional. If `true`, `/signin/google` bypasses Google token validation and uses the provided user payload.
- `Sentry:Dsn` — Sentry DSN. Keep empty in development to disable Sentry.

### Environment variables (recommended for secrets)

ASP.NET Core reads environment variables by default and overrides corresponding appsetting. Use `__` for nesting (example: `Auth__JwtSigningKey` maps to `Auth:JwtSigningKey`).

- `Auth__JwtIssuer`
- `Auth__JwtAudience`
- `Auth__JwtSigningKey` (secret)
- `Auth__GoogleClientId`
- `Sentry__Dsn`
- Optional Mongo (only if generated): `Mongo__ConnectionString` (secret), `Mongo__DatabaseName`
- Optional S3 (only if generated): `S3__ServiceUrl`, `S3__AccessKeyId`, `S3__SecretAccessKey` (secret), `S3__BucketName`, `S3__PublicUrl`

### Optional infra (only if generated)

- If you generated with `--with-mongo-s3-infra`, the corresponding config sections are added to `src/appsettings.[environment].json`.
- These features use mocks by default so the API runs without external services. To use the real implementations, fill the config and uncomment the registrations in `src/WebApplicationBuilderExtensions.cs`.

## Example endpoints

- `GET /posts` — public feed (anonymous; token is optional)
- `POST /posts` — saves the post in Mongo and the image in S3 (only if generated with `--with-mongo-s3-infra`)

## Run locally

```bash
dotnet restore
dotnet run --project src
```

`dotnet run` defaults to `ASPNETCORE_ENVIRONMENT=development` via `src/Properties/launchSettings.json`.

### Swagger (development only)

- Swagger UI: `/swagger` (example: `http://localhost:5000/swagger`)
- OpenAPI JSON: `/swagger/v1/swagger.json`

Note: `.NET` does not read a `.env` file automatically. If you want to keep local secrets in `.env`, load it in your shell before `dotnet run`:

```bash
set -a
source .env
set +a
dotnet run --project src
```

To run as staging/production locally:

```bash
ASPNETCORE_ENVIRONMENT=staging dotnet run --project src
ASPNETCORE_ENVIRONMENT=production dotnet run --project src
```

## Deploy/build

```bash
docker build -t __APP_ID__-webapi:dev .
docker run --rm -p 8080:8080 -e ASPNETCORE_ENVIRONMENT=development __APP_ID__-webapi:dev
```

```bash
cp .env.example .env
# edit .env
bash build-push-img.sh
```

`.env` keys used by scripts:

- `build-push-img.sh` — Required: `REGISTRY_PREFIX`, `REGISTRY_USERNAME`, `REGISTRY_TOKEN`. Optional: `IMAGE_NAME`, `IMAGE_TAG`, `DOCKER_DEFAULT_PLATFORM`.
- `deploy-render.sh` (optional) — `RENDER_DEPLOY_HOOK_URL_DEV/STG/PROD`.

Optional (Render example):

```bash
bash deploy-render.sh --env staging
```
