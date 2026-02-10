# __APP_ID__ mobile

React Native app built with Expo. Builds and distribution use EAS (Expo cloud) via the pinned `npx eas-cli@16.32.0` commands.

## Setup (Expo/EAS)

1. Create an Expo account: `https://expo.dev`
2. Create (or pick) an Expo project in `https://expo.dev`.
   - Set the project `slug` to `__SLUG__` (must end with `-mobile`).
   - Don't run `eas init --id <project-id>` — it won't update this template's dynamic config (`app.config.ts`).
3. Set the EAS project id in `app.config.ts` by replacing `PLACEHOLDER_EAS_PROJECT_ID`.

### iOS devices (internal distribution)
Internal iOS builds need devices registered in your Expo account.
```bash
npx eas-cli@16.32.0 device:create
```

### Channels
```bash
npx eas-cli@16.32.0 channel:create staging
npx eas-cli@16.32.0 channel:create production
```

## Project configuration

### `.env` file

Created automatically for development. To reset:

```bash
cp .env.example .env
```

- `EXPO_PUBLIC_BUILD_ENVIRONMENT` — set to `development`; can also prefix commands with `EXPO_PUBLIC_BUILD_ENVIRONMENT=staging|production`

### `src/providers/ConfigurationProvider.tsx`

- `PLACEHOLDER_WEBAPI_DEV_URL/STG/PROD` — WebApi base URL (use a deployed URL; `localhost` won't work on a real device)
- `PLACEHOLDER_GOOGLE_WEB_CLIENT_ID_DEV/STG/PROD` — Google OAuth web client id 
- `PLACEHOLDER_GOOGLE_IOS_CLIENT_ID_DEV/STG/PROD` — Google OAuth iOS client id 

### `app.config.ts`

- `PLACEHOLDER_IOS_URL_SCHEME_DEV/STG/PROD` — iOS reverse client id / URL scheme for Google Sign-In
- `PLACEHOLDER_EAS_PROJECT_ID` — EAS project id (from expo.dev project settings)
- `PLACEHOLDER_SENTRY_ORG` — Sentry org slug (for Sentry Expo integration)
- `PLACEHOLDER_SENTRY_PROJECT` — Sentry project slug (for Sentry Expo integration)

### `src/SentryLoggerInitializer.tsx`

- `PLACEHOLDER_SENTRY_DSN` — Sentry DSN (events in staging/production only)

## Build development app 
A development client must be built and installed to run the app.

```bash
npm install
npx eas-cli@16.32.0 build --platform android|ios --profile development
```

Install the built app on your device.

## Run locally

```bash
npm run start
```

Need a deployed WebApi? See `../__APP_ID__-webapi/deploy-render.sh` (Render example) after publishing an image with `../__APP_ID__-webapi/build-push-img.sh`.

### To run as staging/production locally, prefix the command:

```bash
EXPO_PUBLIC_BUILD_ENVIRONMENT=staging npm run start
EXPO_PUBLIC_BUILD_ENVIRONMENT=production npm run start
```

## Build staging

```bash
EXPO_PUBLIC_BUILD_ENVIRONMENT=staging npx eas-cli@16.32.0 build --platform all --profile staging
```

## Build production

```bash
EXPO_PUBLIC_BUILD_ENVIRONMENT=production npx eas-cli@16.32.0 build --platform all --profile production
```

## Local native builds (if desired)

```bash
npx expo run:ios
npx expo run:android
```
