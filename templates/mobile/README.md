# __SLUG__ mobile

React Native app built with Expo. Builds and distribution use EAS (Expo cloud) via the pinned `npx eas-cli@16.32.0` commands.

## Setup (first time)
### Expo account

Create an Expo account: `https://expo.dev`

### EAS (first time)

```bash
npx eas-cli@16.32.0 login
npx eas-cli@16.32.0 build:configure
```

### Channels

```bash
npx eas-cli@16.32.0 channel:create staging
npx eas-cli@16.32.0 channel:create production
```

### iOS devices (internal distribution)
The ios builds need to be created with the specific list of iphones that will be able to install them. Ade device to the account so they can be targeted by the build.
```bash
npx eas-cli@16.32.0 device:create
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

## Build dev client (required)

Expo Go is not supported (native modules). You must build a dev client first.

```bash
npm install
npx eas-cli@16.32.0 build --platform ios --profile development
npx eas-cli@16.32.0 build --platform android --profile development
```

Install the builds on your device/emulator.

## Run locally

```bash
npm run start
```

Need a deployed WebApi? See `../__SLUG__-webapi/deploy-render.sh` (Render example) after publishing an image with `../__SLUG__-webapi/build-push-img.sh`.

To run as staging/production locally, prefix the command:

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
