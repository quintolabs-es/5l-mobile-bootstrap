import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";

import { useAuth } from "../../providers/AuthProvider";
import { useLogger } from "../../providers/LoggerProvider";
import { AppError } from "../../AppError";

const LoginScreen: React.FC = () => {
  const logger = useLogger();
  const { signInGoogleAsync, signInAppleAsync } = useAuth();

  const [isSigninInProgress, setIsSignInInProgress] = useState(false);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        setIsAppleAuthAvailable(available);
      } catch (error) {
        logger.logException(new AppError("Failed to check Apple sign-in availability", error));
      }
    })();
  }, [logger]);

  const signInWithGoogleAsync = async () => {
    try {
      setIsSignInInProgress(true);
      await signInGoogleAsync();
    } catch (error) {
      logger.logException(new AppError("Failed sign-in with Google", error));
    } finally {
      setIsSignInInProgress(false);
    }
  };

  const signInWithAppleAsync = async () => {
    try {
      setIsSignInInProgress(true);
      await signInAppleAsync();
    } catch (error) {
      logger.logException(new AppError("Failed sign-in with Apple", error));
    } finally {
      setIsSignInInProgress(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 34, fontWeight: "800", color: "#111" }}>__APP_DISPLAY_NAME__</Text>
      <Text style={{ marginTop: 12, marginBottom: 24, fontSize: 16, color: "#666", lineHeight: 22 }}>
        Welcome to __APP_DISPLAY_NAME__. Sign in to personalize your experience and continue.
      </Text>

      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signInWithGoogleAsync}
        disabled={isSigninInProgress}
      />

      {isAppleAuthAvailable && (
        <View style={{ marginTop: 12 }}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={6}
            style={{ width: "100%", height: 44 }}
            onPress={signInWithAppleAsync}
          />
        </View>
      )}

      {isSigninInProgress && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
};

export default LoginScreen;
