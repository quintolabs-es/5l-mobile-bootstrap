import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";

import { useAuth } from "../../providers/AuthProvider";
import { useLogger } from "../../providers/LoggerProvider";
import { AppError } from "../../AppError";
import SlidingModal from "../modal/SlidingModal";
import loginModalStyles from "./loginModalStyles";

type LoginModalProps = Readonly<{
  loginModalVisible: boolean;
  closeLoginModal: () => void;
  displayExplainingMessage?: boolean;
}>;

const LoginSlidingModal: React.FC<LoginModalProps> = ({
  loginModalVisible,
  closeLoginModal,
  displayExplainingMessage = false
}) => {
  const [isSigninInProgress, setIsSignInInProgress] = useState(false);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState<boolean>();

  const { signInGoogleAsync, signInAppleAsync } = useAuth();
  const logger = useLogger();

  useEffect(() => {
    const checkAppleAuthAvailableAsync = async () => {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleAuthAvailable(available);
    };
    checkAppleAuthAvailableAsync();
  }, []);

  const signInWithGoogleAndCloseAsync = async () => {
    try {
      setIsSignInInProgress(true);
      await signInGoogleAsync();
    } catch (error) {
      logger.logException(new AppError("Failed sign-in with Google", error));
    } finally {
      setIsSignInInProgress(false);
      closeLoginModal();
    }
  };

  const signInWithAppleAndCloseAsync = async () => {
    try {
      setIsSignInInProgress(true);
      await signInAppleAsync();
    } catch (error) {
      logger.logException(new AppError("Failed sign-in with Apple", error));
    } finally {
      setIsSignInInProgress(false);
      closeLoginModal();
    }
  };

  return (
    <SlidingModal visible={loginModalVisible} close={closeLoginModal}>
      <View style={loginModalStyles.container}>
        {displayExplainingMessage && <Text>Sign in to continue</Text>}

        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signInWithGoogleAndCloseAsync}
          disabled={isSigninInProgress}
        />

        {isAppleAuthAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={6}
            style={loginModalStyles.appleLoginButton}
            onPress={signInWithAppleAndCloseAsync}
          />
        )}
      </View>
    </SlidingModal>
  );
};

export default LoginSlidingModal;

