import React, { createContext, useContext, ReactNode } from "react";
import * as Sentry from "@sentry/react-native";

type LoggerContextType = Readonly<{
  logMessage: (message: string) => void;
  logException: (error: unknown) => void;
  logDebug: (message: string) => void;
}>;

const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

export const useLogger = (): LoggerContextType => {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error("useLogger must be used within a LoggerProvider");
  }
  return context;
};

export const LoggerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isSentryInitialized = !!Sentry.getClient();

  const sentryLogger: LoggerContextType = {
    logMessage: (message: string) => Sentry.captureMessage(message),
    logException: (error: unknown) => Sentry.captureException(error),
    logDebug: (message: string) => console.debug(message)
  };

  const consoleLogger: LoggerContextType = {
    logMessage: (message: string) => console.info(message),
    logException: (error: unknown) => console.error(error),
    logDebug: (message: string) => console.debug(message)
  };

  const logger = isSentryInitialized ? sentryLogger : consoleLogger;

  return <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>;
};

