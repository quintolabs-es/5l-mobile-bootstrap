import React, { createContext, ReactNode, useCallback, useContext, useMemo } from "react";
import Constants from "expo-constants";

const VALID_ENVIRONMENTS = ["development", "staging", "production"] as const;
export type EnvironmentName = (typeof VALID_ENVIRONMENTS)[number];

export type Environment = Readonly<{
  environmentName: EnvironmentName;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
}>;

const resolveEnvironmentName = (): EnvironmentName => {
  const raw = process.env.EXPO_PUBLIC_ENVIRONMENT;
  if (raw && (VALID_ENVIRONMENTS as readonly string[]).includes(raw)) {
    return raw as EnvironmentName;
  }

  throw new Error(
    [
      "[Environment] EXPO_PUBLIC_ENVIRONMENT is missing or invalid.",
      `Received: ${JSON.stringify(raw)}.`,
      `Expected one of: ${VALID_ENVIRONMENTS.join(", ")}.`,
      "Set EXPO_PUBLIC_ENVIRONMENT in your environment variables or .env file before running the app."
    ].join(" ")
  );
};

let cachedEnvironment: Environment | null = null;

export const getResolvedEnvironment = (): Environment => {
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  const environmentName = resolveEnvironmentName();
  cachedEnvironment = {
    environmentName,
    isDevelopment: environmentName === "development",
    isStaging: environmentName === "staging",
    isProduction: environmentName === "production"
  };

  return cachedEnvironment;
};

export type AppConfig = Readonly<{
  apiBaseUrl: string;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
}>;

export type GoogleSignInConfig = Readonly<{
  webClientId: string;
  iosClientId: string;
  scopes: string[];
  mockEnabled?: boolean;
}>;

export type ExpoPlatformConfig = Readonly<{
  easProjectId: string | null;
}>;

export type ConfigurationContextType = Readonly<{
  getEnvironmentConfig: () => Environment;
  getAppConfig: () => AppConfig;
  getGoogleSignInConfig: () => GoogleSignInConfig;
  getExpoPlatformConfig: () => ExpoPlatformConfig;
}>;

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export const useConfiguration = (): ConfigurationContextType => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error("useConfiguration must be used within a ConfigurationProvider");
  }
  return context;
};

export const ConfigurationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const environment = useMemo((): Environment => getResolvedEnvironment(), []);
  const { environmentName, isDevelopment, isStaging, isProduction } = environment;

  // Note: Cannot use useLogger here as this provider is initialized before LoggerProvider
  console.log(`Running ConfigurationProvider on environment ${JSON.stringify(environmentName)}`);

  const appConfig: AppConfig = useMemo(() => {
    return {
      apiBaseUrl: isDevelopment
        ? "PLACEHOLDER_WEBAPI_DEV_URL"
        : isStaging
          ? "PLACEHOLDER_WEBAPI_STG_URL"
          : "PLACEHOLDER_WEBAPI_PROD_URL",
      isDevelopment,
      isStaging,
      isProduction
    };
  }, [isDevelopment, isProduction, isStaging]);

  const googleSignInConfig: GoogleSignInConfig = useMemo(() => {
    return {
      webClientId: isDevelopment
        ? "PLACEHOLDER_GOOGLE_WEB_CLIENT_ID_DEV"
        : isStaging
          ? "PLACEHOLDER_GOOGLE_WEB_CLIENT_ID_STG"
          : "PLACEHOLDER_GOOGLE_WEB_CLIENT_ID_PROD",
      iosClientId: isDevelopment
        ? "PLACEHOLDER_GOOGLE_IOS_CLIENT_ID_DEV"
        : isStaging
          ? "PLACEHOLDER_GOOGLE_IOS_CLIENT_ID_STG"
          : "PLACEHOLDER_GOOGLE_IOS_CLIENT_ID_PROD",
      scopes: ["email"],
      mockEnabled: false
    };
  }, [isDevelopment, isStaging]);

  const expoPlatformConfig: ExpoPlatformConfig = useMemo(() => {
    const easProjectId =
      (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId ??
      null;

    return { easProjectId };
  }, []);

  const getEnvironmentConfig = useCallback(() => environment, [environment]);
  const getAppConfig = useCallback(() => appConfig, [appConfig]);
  const getGoogleSignInConfig = useCallback(() => googleSignInConfig, [googleSignInConfig]);
  const getExpoPlatformConfig = useCallback(() => expoPlatformConfig, [expoPlatformConfig]);

  const value: ConfigurationContextType = useMemo(() => {
    return { getEnvironmentConfig, getAppConfig, getGoogleSignInConfig, getExpoPlatformConfig };
  }, [getAppConfig, getEnvironmentConfig, getExpoPlatformConfig, getGoogleSignInConfig]);

  return <ConfigurationContext.Provider value={value}>{children}</ConfigurationContext.Provider>;
};
