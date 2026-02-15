import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";

import { useAuth } from "../../providers/AuthProvider";
import { useConfiguration } from "../../providers/ConfigurationProvider";
import { useLogger } from "../../providers/LoggerProvider";
import { AppError } from "../../AppError";
import { appStylesConstants } from "../../styles/appStylesConstants";
import { appGlobalStyles } from "../../styles/appGlobalStyles";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appStylesConstants.colors.background,
    paddingHorizontal: appStylesConstants.spacing.xl,
    justifyContent: "center"
  },
  title: {
    fontSize: appStylesConstants.text.title,
    fontWeight: "800",
    color: appStylesConstants.colors.textPrimary
  },
  intro: {
    marginTop: appStylesConstants.spacing.md,
    marginBottom: appStylesConstants.spacing.xl,
    fontSize: appStylesConstants.text.body,
    color: appStylesConstants.colors.textSecondary,
    lineHeight: appStylesConstants.text.bodyLineHeight
  },
  appleButtonContainer: {
    marginTop: appStylesConstants.spacing.md
  },
  appleButton: {
    width: "100%",
    height: appStylesConstants.sizes.primaryButtonHeight
  },
  mockSignInContainer: {
    marginTop: appStylesConstants.spacing.md
  },
  activityIndicator: {
    marginTop: appStylesConstants.spacing.lg
  }
});

const LoginScreen: React.FC = () => {
  const logger = useLogger();
  const { getAppConfig } = useConfiguration();
  const { mockSignInEnabled } = getAppConfig();

  const { signInGoogleAsync, signInAppleAsync, mockSignInAsync } = useAuth();

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

  const mockSignInAsyncAndContinue = async () => {
    try {
      setIsSignInInProgress(true);
      await mockSignInAsync();
    } catch (error) {
      logger.logException(new AppError("Failed mock sign-in", error));
    } finally {
      setIsSignInInProgress(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>__APP_DISPLAY_NAME__</Text>
      <Text style={styles.intro}>
        Welcome to __APP_DISPLAY_NAME__. Sign in to personalize your experience and continue.
      </Text>

      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signInWithGoogleAsync}
        disabled={isSigninInProgress}
      />

      {isAppleAuthAvailable && (
        <View style={styles.appleButtonContainer}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={appStylesConstants.radii.sm}
            style={styles.appleButton}
            onPress={signInWithAppleAsync}
          />
        </View>
      )}

      {mockSignInEnabled && (
        <View style={styles.mockSignInContainer}>
          <Pressable
            onPress={mockSignInAsyncAndContinue}
            disabled={isSigninInProgress}
            style={[appGlobalStyles.primaryButton, isSigninInProgress ? { opacity: 0.6 } : null]}
          >
            <Text style={appGlobalStyles.primaryButtonText}>Mock Sign In</Text>
          </Pressable>
        </View>
      )}

      {isSigninInProgress && (
        <ActivityIndicator style={styles.activityIndicator} color={appStylesConstants.activityIndicator.color} />
      )}
    </View>
  );
};

export default LoginScreen;
