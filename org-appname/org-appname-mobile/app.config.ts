import { ExpoConfig } from "expo/config";
import { withSentry } from "@sentry/react-native/expo";

const VALID_ENVIRONMENTS = ["development", "staging", "production"] as const;
type BuildEnvironment = (typeof VALID_ENVIRONMENTS)[number];

const buildEnvironmentName = process.env.EXPO_PUBLIC_BUILD_ENVIRONMENT as BuildEnvironment | undefined;

if (!buildEnvironmentName) {
  throw new Error(
    `[app.config] EXPO_PUBLIC_BUILD_ENVIRONMENT is not set. Expected one of: ${VALID_ENVIRONMENTS.join(", ")}`
  );
}

if (!VALID_ENVIRONMENTS.includes(buildEnvironmentName)) {
  throw new Error(
    `[app.config] Invalid EXPO_PUBLIC_BUILD_ENVIRONMENT="${buildEnvironmentName}". Expected one of: ${VALID_ENVIRONMENTS.join(", ")}`
  );
}

const isDev = buildEnvironmentName === "development";
const isStg = buildEnvironmentName === "staging";
const isPro = buildEnvironmentName === "production";

const name = isDev ? "Appname DEV" : isStg ? "Appname STG" : "Appname";

const appScheme = isDev ? "org-appname-dev" : isStg ? "org-appname-stg" : "org-appname";

const packageId = isDev ? "com.org.appname.dev" : isStg ? "com.org.appname.stg" : "com.org.appname";

// Must match the reverse client ID created in Google Cloud (iOS). Keep placeholders until configured.
const googleOAuthReverseUrlSchemeForIos = isDev
  ? "com.googleusercontent.apps.PLACEHOLDER_IOS_URL_SCHEME_DEV"
  : isStg
    ? "com.googleusercontent.apps.PLACEHOLDER_IOS_URL_SCHEME_STG"
    : "com.googleusercontent.apps.PLACEHOLDER_IOS_URL_SCHEME_PRO";

const config: ExpoConfig = {
  name,
  slug: "org-appname",
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
  extra: {
    eas: {
      projectId: "PLACEHOLDER_EAS_PROJECT_ID"
    }
  }
};

export default withSentry(config, {
  url: "https://sentry.io/",
  project: "PLACEHOLDER_SENTRY_PROJECT",
  organization: "PLACEHOLDER_SENTRY_ORG"
});

