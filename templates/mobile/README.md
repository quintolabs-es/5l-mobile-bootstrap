# __APP_ID__ mobile

React Native app built with Expo. Builds and distribution use EAS (Expo cloud) via the pinned `npx eas-cli@16.32.0` commands.

A git repo has already been initialized in __APP_ID__. It is required to build the mobile app.

## Setup (Expo/EAS)

1. Create an Expo account: `https://expo.dev`
2. Create (or pick) an Expo project in `https://expo.dev`.
   - Set the project `slug` to `__SLUG__`.
   - **Don't run** `eas init --id <project-id>` as instructed in project creation — it will fail to update this template's dynamic config (`app.config.ts`).
3. Set the EAS project id in `app.config.ts` by replacing `PLACEHOLDER_EAS_PROJECT_ID`.

#### iOS devices (internal distribution)
Internal iOS builds need devices registered in your Expo account. To install the builds in iOS the devices need to be registered. Not required for Android.
```bash
npx eas-cli@16.32.0 device:create
```

#### Configure app updates
When only typescript code changes (no native code or native plugin added), a new build is not required. Instead an update is published and the apps just fetch the latest.
Builds configured with a channel (like `staging` or `production` in eas.json) will fetch updates published to that same channel (so `production` devices don’t accidentally get `staging` updates). Updates are not needed for `development`, since development runs from local code.

Docs:
- [EAS Update (getting started)](https://docs.expo.dev/eas-update/getting-started/)
- [Builds and updates](https://docs.expo.dev/build/updates/)
- [`app.config` updates config](https://docs.expo.dev/versions/latest/config/app/#updates)
- [Expo FYI: EAS Update config](https://github.com/expo/fyi/blob/main/eas-update-config.md)

This is handled by `expo-updates` package (already included)

##### Create channels (first time)

```bash
npx eas-cli@16.32.0 channel:create staging
npx eas-cli@16.32.0 channel:create production
```

In `eas.json`, each build profile specifies its channel (staging/production). Publish updates to a branch and point the channel to it (by convention, same name).

##### Configure updates in app

In `app.config.ts`, this template uses:

```json
{
  "updates": {
    "url": "https://u.expo.dev/<EAS ProjectId>",
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 5000
  },
  "runtimeVersion": {
    "policy": "appVersion"
  }
}
```

##### Publish update

This template's `app.config.ts` is dynamic and depends on `EXPO_PUBLIC_BUILD_ENVIRONMENT`. Set it explicitly when publishing, or you may publish with the wrong environment config:

```bash
EXPO_PUBLIC_BUILD_ENVIRONMENT=staging npx eas-cli@16.32.0 update --branch staging --message "MESSAGE"
EXPO_PUBLIC_BUILD_ENVIRONMENT=production npx eas-cli@16.32.0 update --branch production --message "MESSAGE"
```

## Project configuration

#### `.env` file

Created automatically for development.
- `EXPO_PUBLIC_BUILD_ENVIRONMENT` — already set to `development`; can also prefix commands with `EXPO_PUBLIC_BUILD_ENVIRONMENT=development|staging|production` if desired.

#### `src/providers/ConfigurationProvider.tsx`

- `PLACEHOLDER_WEBAPI_DEV_URL/STG/PROD` — WebApi base URL (use a deployed URL; `localhost` won't work on a real device)
- `PLACEHOLDER_GOOGLE_WEB_CLIENT_ID_DEV/STG/PROD` — Google OAuth web client id 
- `PLACEHOLDER_GOOGLE_IOS_CLIENT_ID_DEV/STG/PROD` — Google OAuth iOS client id 
- `mockSignInEnabled` — optional dev helper; when true, shows a "Mock Sign In" button to bypass native login

#### `app.config.ts`

- `PLACEHOLDER_IOS_URL_SCHEME_DEV/STG/PROD` — iOS reverse client id / URL scheme for Google Sign-In
- `PLACEHOLDER_EAS_PROJECT_ID` — EAS project id (from expo.dev project settings)
- `PLACEHOLDER_SENTRY_ORG` — Sentry org slug (for Sentry Expo integration)
- `PLACEHOLDER_SENTRY_PROJECT` — Sentry project slug (for Sentry Expo integration)

#### `src/SentryLoggerInitializer.tsx`

- `PLACEHOLDER_SENTRY_DSN` — Sentry DSN (events in staging/production only)

## Build development app 
A development client must be built and installed to run the app.

```bash
cd __APP_ID__-mobile
npm install

npx eas-cli@16.32.0 build --platform android --profile development
> Generate a new Android Keystore? - Y

# or
npx eas-cli@16.32.0 build --platform ios --profile development
```
Follow up the build in the terminal or in `expo.dev`. 
When ready, download and install the app on the device, and ready to run locally.

## Run locally

```bash
cd __APP_ID__-mobile
npm run start
```
Then open the app on the mobile and scan the QR from the CLI.

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
