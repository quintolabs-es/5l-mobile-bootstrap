import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";

import { getResolvedEnvironment } from "./providers/ConfigurationProvider";

const initializeSentryIfIsNotDev = () => {
  const environment = getResolvedEnvironment();
  const sendEventsToSentry = environment.isStaging || environment.isProduction;

  if (sendEventsToSentry) {
    Sentry.init({
      dsn: "PLACEHOLDER_SENTRY_DSN",
      sendDefaultPii: true,
      environment: environment.environmentName
    });

    Sentry.setContext("os", { name: Platform.OS });

    return Sentry;
  }

  return null;
};

export default initializeSentryIfIsNotDev;
