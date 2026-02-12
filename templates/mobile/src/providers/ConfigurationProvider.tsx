import React, { createContext, ReactNode, useCallback, useContext, useMemo } from "react";
import Constants from "expo-constants";

import { BuildEnvironment, getBuildEnvironment } from "../BuildEnvironment";

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
  getEnvironmentConfig: () => BuildEnvironment;
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
  const environment = useMemo(() => getBuildEnvironment(), []);
  const { buildEnvironmentName, isDevelopment, isStaging, isProduction } = environment;

  // Note: Cannot use useLogger here as this provider is initialized before LoggerProvider
  console.log(`Running ConfigurationProvider on buildEnvironment ${JSON.stringify(buildEnvironmentName)}`);

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
