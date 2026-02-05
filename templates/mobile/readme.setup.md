# __SLUG__ mobile setup

## Expo account

Create an Expo account (or sign in): https://expo.dev

## EAS (first time)

```bash
npx eas-cli@16.32.0 login
npx eas-cli@16.32.0 build:configure
```

## Channels

```bash
npx eas-cli@16.32.0 channel:create staging
npx eas-cli@16.32.0 channel:create production
```

## iOS devices (internal distribution)

```bash
npx eas-cli@16.32.0 device:create
```
