import axios, { AxiosError, AxiosInstance } from "axios";
import { AppleAuthenticationCredential } from "expo-apple-authentication";
import { User as GoogleUser } from "@react-native-google-signin/google-signin";

import { AppleAuthUser, GoogleAuthUser, SignInModel, TokensModel } from "../types/authTypes";
import { useConfiguration } from "../providers/ConfigurationProvider";
import { useLogger } from "../providers/LoggerProvider";
import { AppError } from "../AppError";

interface SignInClient {
  signInWithGoogleAsync: (userInfo: GoogleUser) => Promise<SignInModel>;
  signInWithAppleAsync: (appleAuthCredential: AppleAuthenticationCredential) => Promise<SignInModel>;
  refreshTokenAsync: (tokens: TokensModel) => Promise<TokensModel | null>;
}

export default function useSignInClient(): SignInClient {
  const { getAppConfig, getGoogleSignInConfig } = useConfiguration();
  const { apiBaseUrl } = getAppConfig();
  const { mockEnabled: googleSignInMock } = getGoogleSignInConfig();
  const logger = useLogger();

  const apiClient: AxiosInstance = axios.create({ baseURL: apiBaseUrl });

  const signInWithGoogleAsync = async (userInfo: GoogleUser): Promise<SignInModel> => {
    if (!userInfo.idToken) {
      throw new AppError("To sign in with Google, idToken must be provided.");
    }

    const googleAuthUser: GoogleAuthUser = {
      idToken: userInfo.idToken,
      user: {
        id: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        givenName: userInfo.user.givenName,
        familyName: userInfo.user.familyName
      }
    };

    try {
      const response = await apiClient.post<SignInModel>("/signin/google", googleAuthUser, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error) {
      captureHttpError(error);
      throw error;
    }
  };

  const mockSignInWithGoogleAsync = async (): Promise<SignInModel> => {
    return {
      tokens: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token"
      },
      user: {
        id: "mock-user-1",
        email: "mock.user@example.com",
        nickName: "Mock User",
        givenName: "Mock",
        familyName: "User",
        authProvider: "google",
        idInProvider: "ggl-mock-user-1"
      }
    };
  };

  const signInWithAppleAsync = async (appleAuthCredential: AppleAuthenticationCredential): Promise<SignInModel> => {
    if (!appleAuthCredential.identityToken) {
      throw new AppError("To sign in with Apple, identityToken must be provided.");
    }

    const appleAuthUser: AppleAuthUser = {
      idToken: appleAuthCredential.identityToken,
      user: {
        id: appleAuthCredential.user,
        email: appleAuthCredential.email,
        nickName: appleAuthCredential.fullName?.nickname ?? null,
        givenName: appleAuthCredential.fullName?.givenName ?? null,
        familyName: appleAuthCredential.fullName?.familyName ?? null
      }
    };

    try {
      const response = await apiClient.post<SignInModel>("/signin/apple", appleAuthUser, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error) {
      captureHttpError(error);
      throw error;
    }
  };

  const refreshTokenAsync = async (tokens: TokensModel): Promise<TokensModel | null> => {
    try {
      const response = await apiClient.post<TokensModel>(
        "/signin/refresh",
        { refreshToken: tokens.refreshToken },
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
      );
      return response.data;
    } catch (error) {
      captureHttpError(error);
      return null;
    }
  };

  const captureHttpError = (error: unknown): void => {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      logger.logException(
        new AppError(
          `HTTP error: ${axiosError.message}. Status: ${axiosError.response?.status}. Body: ${JSON.stringify(
            axiosError.response?.data
          )}`,
          axiosError
        )
      );
      return;
    }

    logger.logException(new AppError("Unexpected error", error));
  };

  return {
    signInWithGoogleAsync: googleSignInMock ? mockSignInWithGoogleAsync : signInWithGoogleAsync,
    signInWithAppleAsync,
    refreshTokenAsync
  };
}
