import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ConfigureParams, GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";

import { SignInModel, UserModel } from "../types/authTypes";
import useSignInClient from "../hooks/useSignInClient";
import useLocalLoginStorage from "../hooks/useLocalLoginStorage";
import { useConfiguration } from "./ConfigurationProvider";
import { useLogger } from "./LoggerProvider";
import { AppError } from "../AppError";

type AuthContextType = Readonly<{
  accessToken: string | null;
  currentUser: UserModel | null;
  signInGoogleAsync: () => Promise<void>;
  signInAppleAsync: () => Promise<void>;
  signOutAsync: () => Promise<void>;
}>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logger = useLogger();
  const signInClient = useSignInClient();
  const loginStorage = useLocalLoginStorage();

  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const { getGoogleSignInConfig } = useConfiguration();
  const googleSignInConfig = getGoogleSignInConfig();

  useEffect(() => {
    (async () => {
      try {
        const signInModel = await loginStorage.getAsync();
        if (!signInModel) return;

        const freshTokens = await signInClient.refreshTokenAsync(signInModel.tokens);
        if (!freshTokens) {
          await signOutAsync();
          return;
        }

        signInModel.tokens = freshTokens;
        setCurrentUser(signInModel.user);
        setAccessToken(signInModel.tokens.accessToken);
        await loginStorage.saveAsync(signInModel);
      } catch (error) {
        logger.logException(new AppError("Error loading sign-in model. Signing out.", error));
        await signOutAsync();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInGoogleAsync = async (): Promise<void> => {
    const options: ConfigureParams = {
      webClientId: googleSignInConfig.webClientId,
      iosClientId: googleSignInConfig.iosClientId,
      scopes: googleSignInConfig.scopes
    };

    try {
      GoogleSignin.configure(options);
      const response = await GoogleSignin.signIn();

      if (response.type !== "success") {
        throw new Error("Google sign-in was not successful");
      }

      const signInModel = await signInClient.signInWithGoogleAsync(response.data);
      await signInLocalClientAsync(signInModel);
    } catch (error) {
      logger.logException(new AppError("Failed Google sign-in", error));
      await signOutAsync();
    }
  };

  const signInAppleAsync = async (): Promise<void> => {
    try {
      const appleSignInOptions: AppleAuthentication.AppleAuthenticationSignInOptions = {
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      };

      const appleAuthCredential = await AppleAuthentication.signInAsync(appleSignInOptions);
      const signInModel = await signInClient.signInWithAppleAsync(appleAuthCredential);
      await signInLocalClientAsync(signInModel);
    } catch (error: any) {
      if (error?.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      logger.logException(new AppError("Failed Apple sign-in", error));
    }
  };

  const signInLocalClientAsync = async (signInModel: SignInModel): Promise<void> => {
    setCurrentUser(signInModel.user);
    setAccessToken(signInModel.tokens.accessToken);
    await loginStorage.saveAsync(signInModel);
  };

  const signOutAsync = async (): Promise<void> => {
    setCurrentUser(null);
    setAccessToken(null);
    await loginStorage.removeAsync();
  };

  const value = useMemo<AuthContextType>(() => {
    return { accessToken, currentUser, signInGoogleAsync, signInAppleAsync, signOutAsync };
  }, [accessToken, currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

