import { ExpoConfig } from "expo/config";
import { withSentry } from "@sentry/react-native/expo";

const VALID_ENVIRONMENTS = ["development", "staging", "production"] as const;
type Environment = (typeof VALID_ENVIRONMENTS)[number];

// Versioning strategy:
// - APP_VERSION: bump for every store release (user-visible version).
// - IOS_BUILD_NUMBER: must increase for every iOS upload, or App Store will reject it.
// - ANDROID_VERSION_CODE: must increase for every Android upload, or Play will reject it.
// - RUNTIME_VERSION: OTA compatibility key; bump only when native code/config changes.
//   If you don't bump when native changes, OTA updates can break older builds.
//   If you bump without shipping a new build, OTA updates won't apply to existing installs.
const APP_VERSION = "0.0.1";
const RUNTIME_VERSION = "1";
const IOS_BUILD_NUMBER = "1";
const ANDROID_VERSION_CODE = 1;

const environmentName = process.env.EXPO_PUBLIC_ENVIRONMENT as Environment | undefined;

if (!environmentName) {
  throw new Error(
    `[app.config] EXPO_PUBLIC_ENVIRONMENT is not set. Expected one of: ${VALID_ENVIRONMENTS.join(", ")}`
  );
}

if (!VALID_ENVIRONMENTS.includes(environmentName)) {
  throw new Error(
    `[app.config] Invalid EXPO_PUBLIC_ENVIRONMENT="${environmentName}". Expected one of: ${VALID_ENVIRONMENTS.join(", ")}`
  );
}

const isDev = environmentName === "development";
const isStg = environmentName === "staging";
const isPro = environmentName === "production";

const name = isDev ? "__APP_DISPLAY_NAME__ DEV" : isStg ? "__APP_DISPLAY_NAME__ STG" : "__APP_DISPLAY_NAME__";

const appScheme = isDev ? "__APP_ID__-dev" : isStg ? "__APP_ID__-stg" : "__APP_ID__";

const packageId = isDev ? "__BUNDLE_ID_BASE__.dev" : isStg ? "__BUNDLE_ID_BASE__.stg" : "__BUNDLE_ID_BASE__";

const easProjectId = "PLACEHOLDER_EAS_PROJECT_ID";

// Must match the reverse client ID created in Google Cloud (iOS). Keep placeholders until configured.
const googleOAuthReverseUrlSchemeForIos = isDev
  ? "com.googleusercontent.apps.PLACEHOLDER_IOS_URL_SCHEME_DEV"
  : isStg
    ? "com.googleusercontent.apps.PLACEHOLDER_IOS_URL_SCHEME_STG"
    : "com.googleusercontent.apps.PLACEHOLDER_IOS_URL_SCHEME_PRO";

const config: ExpoConfig = {
  name,
  slug: "__SLUG__",
  scheme: appScheme,
  version: APP_VERSION,
  platforms: ["ios", "android"],
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: [
    "expo-apple-authentication",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: googleOAuthReverseUrlSchemeForIos
      }
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#faf9f6",
        // image: "./assets/splash.png",
        resizeMode: "contain"
      }
    ]
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: packageId,
    buildNumber: IOS_BUILD_NUMBER,
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [appScheme, googleOAuthReverseUrlSchemeForIos]
        }
      ]
    },
    usesAppleSignIn: true
  },
  android: {
    package: packageId,
    versionCode: ANDROID_VERSION_CODE
  },
  updates: {
    enabled: true,
    url: `https://u.expo.dev/${easProjectId}`,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 5000
  },
  runtimeVersion: RUNTIME_VERSION,
  extra: {
    eas: {
      projectId: easProjectId
    }
  }
};

export default withSentry(config, {
  url: "https://sentry.io/",
  project: "PLACEHOLDER_SENTRY_PROJECT",
  organization: "PLACEHOLDER_SENTRY_ORG"
});
