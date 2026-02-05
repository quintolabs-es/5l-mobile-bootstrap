# __SLUG__ mobile

## Setup (first time)

See `readme.setup.md`.

## Configuration

```bash
cp .env.example .env
```

### `.env`

- `EXPO_PUBLIC_BUILD_ENVIRONMENT` — set to `development`; can also prefix commands with `EXPO_PUBLIC_BUILD_ENVIRONMENT=staging|production`

### `src/providers/ConfigurationProvider.tsx`

- `PLACEHOLDER_WEBAPI_DEV_URL/STG/PROD` — WebApi base URL 
- `PLACEHOLDER_GOOGLE_WEB_CLIENT_ID_DEV/STG/PROD` — Google OAuth web client id 
- `PLACEHOLDER_GOOGLE_IOS_CLIENT_ID_DEV/STG/PROD` — Google OAuth iOS client id 

### `app.config.ts`

- `PLACEHOLDER_IOS_URL_SCHEME_DEV/STG/PROD` — iOS reverse client id / URL scheme for Google Sign-In
- `PLACEHOLDER_EAS_PROJECT_ID` — EAS project id (from expo.dev project settings)
- `PLACEHOLDER_SENTRY_ORG` — Sentry org slug (for Sentry Expo integration)
- `PLACEHOLDER_SENTRY_PROJECT` — Sentry project slug (for Sentry Expo integration)

### `src/SentryLoggerInitializer.tsx`

- `PLACEHOLDER_SENTRY_DSN` — Sentry DSN (events in staging/production only)

## Run locally (development)

To run the app, Expo Go is not enough, and a new build is required.

### Build a dev client
```bash
npm install
cp .env.example .env
npx eas-cli@16.32.0 build --platform ios --profile development
npx eas-cli@16.32.0 build --platform android --profile development
```

Then download it and install it in the mobile.

### Run locally

```bash
npm run start
```

To run as staging/production locally, prefix the command:

```bash
EXPO_PUBLIC_BUILD_ENVIRONMENT=staging npm run start
EXPO_PUBLIC_BUILD_ENVIRONMENT=production npm run start
```

## Build staging/production

```bash
EXPO_PUBLIC_BUILD_ENVIRONMENT=staging npx eas-cli@16.32.0 build --platform all --profile staging|production
```

