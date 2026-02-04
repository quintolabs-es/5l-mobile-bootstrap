import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";
import { buildEnvironment } from "./BuildEnvironment";

const initializeSentryIfIsNotDev = () => {
  const sendEventsToSentry = buildEnvironment.isStaging || buildEnvironment.isProduction;

  if (sendEventsToSentry) {
    Sentry.init({
      dsn: "PLACEHOLDER_SENTRY_DSN",
      sendDefaultPii: true,
      environment: buildEnvironment.buildEnvironmentName
    });

    Sentry.setContext("os", { name: Platform.OS });

    return Sentry;
  }

  return null;
};

export default initializeSentryIfIsNotDev;

