import { ExpoConfig } from "expo/config";
import { withSentry } from "@sentry/react-native/expo";

const VALID_ENVIRONMENTS = ["development", "staging", "production"] as const;
type Environment = (typeof VALID_ENVIRONMENTS)[number];

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
    package: packageId
  },
  updates: {
    enabled: true,
    url: `https://u.expo.dev/${easProjectId}`,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 5000
  },
  runtimeVersion: {
    policy: "appVersion"
  },
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
