# org-appname

Bootstrap project generated from `5l-rn-bootstrap`.

## Required manual configuration

### Mobile (`*-mobile`)
- Set `EXPO_PUBLIC_BUILD_ENVIRONMENT` to `development`, `staging`, or `production`.
- Fill placeholders in `*-mobile/src/providers/ConfigurationProvider.tsx`:
  - `PLACEHOLDER_WEBAPI_DEV_URL`, `PLACEHOLDER_WEBAPI_STG_URL`, `PLACEHOLDER_WEBAPI_PROD_URL`
  - Google `PLACEHOLDER_GOOGLE_*_CLIENT_ID_*` values (web + iOS client IDs)
- Fill placeholders in `*-mobile/app.config.ts`:
  - `PLACEHOLDER_IOS_URL_SCHEME_*` (Google reverse client ID for iOS)
  - `PLACEHOLDER_EAS_PROJECT_ID` (if using EAS)
  - `PLACEHOLDER_SENTRY_ORG` / `PLACEHOLDER_SENTRY_PROJECT` (if using Sentry)

### WebApi (`*-webapi`)
- Set `ASPNETCORE_ENVIRONMENT` to `development`, `staging`, or `production`.
- Fill placeholders in `*-webapi/src/appsettings*.json`:
  - `Auth.GoogleClientId` (should match the mobile Google *web* client ID used to mint idTokens)
  - `Auth.JwtIssuer`, `Auth.JwtAudience`, `Auth.JwtSigningKey`
  - `Sentry.Dsn` (used in staging/production)
- `App.MobileAppBundleId` must match the iOS bundle id; scaffold sets it from the slug.

### Mongo (optional)
- Config: fill `Mongo` placeholders in `*-webapi/src/appsettings*.json`.
- Code: WebApi uses `MockMongoExampleService` by default. To enable real Mongo, uncomment `MongoExampleService` in `*-webapi/src/WebApplicationBuilderExtensions.cs`.

### S3 (optional)
- Config: fill `S3` placeholders in `*-webapi/src/appsettings*.json`.
- Code: WebApi uses `MockS3ExampleService` by default. To enable real S3, uncomment `S3ExampleService` in `*-webapi/src/WebApplicationBuilderExtensions.cs`.

## Run (scaffold-only)

### WebApi
```bash
cd org-appname/org-appname-webapi
dotnet restore
dotnet build
dotnet run --project src
```

### Mobile
```bash
cd org-appname/org-appname-mobile
npm install
npm run ios
```

## Projects
- WebApi: Org.Appname.WebApi
- WebApi tests: Org.Appname.WebApi.Tests
