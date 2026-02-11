import "react-native-gesture-handler";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import initializeSentryIfIsNotDev from "./src/SentryLoggerInitializer";
import { ConfigurationProvider } from "./src/providers/ConfigurationProvider";
import { LoggerProvider } from "./src/providers/LoggerProvider";
import { AuthProvider } from "./src/providers/AuthProvider";
import { ApiClientProvider } from "./src/providers/ApiClientProvider";

import HomeScreen from "./src/screens/home/HomeScreen";

export type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "__APP_DISPLAY_NAME__" }} />
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <LoggerProvider>
        <ConfigurationProvider>
          <AuthProvider>
            <ApiClientProvider>
              <RootNavigator />
            </ApiClientProvider>
          </AuthProvider>
        </ConfigurationProvider>
      </LoggerProvider>
    </NavigationContainer>
  );
};

const SentryWrappedApp: React.FC = () => {
  const sentry = initializeSentryIfIsNotDev();

  if (sentry) {
    const Wrapped = sentry.wrap(App);
    return <Wrapped />;
  }

  return <App />;
};

export default SentryWrappedApp;
