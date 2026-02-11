import React, { createContext, ReactNode, useContext, useEffect, useMemo } from "react";
import axios, { AxiosError, AxiosInstance } from "axios";

import { useAuth } from "./AuthProvider";
import { useConfiguration } from "./ConfigurationProvider";
import { useLogger } from "./LoggerProvider";
import { AppError } from "../AppError";
import { PostModel, PostsResponse } from "../types/postsTypes";

type ApiClientContextType = Readonly<{
  getPostsAsync: () => Promise<PostModel[]>;
}>;

const ApiClientContext = createContext<ApiClientContextType | undefined>(undefined);

export const useApiClient = (): ApiClientContextType => {
  const ctx = useContext(ApiClientContext);
  if (!ctx) {
    throw new Error("useApiClient must be used within an ApiClientProvider");
  }
  return ctx;
};

export const ApiClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logger = useLogger();
  const { getAppConfig } = useConfiguration();
  const { apiBaseUrl } = getAppConfig();
  const { accessToken, signOutAsync } = useAuth();

  const apiClient: AxiosInstance = useMemo(() => axios.create({ baseURL: apiBaseUrl }), [apiBaseUrl]);

  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(interceptor);
    };
  }, [accessToken, apiClient]);

  const getPostsAsync = async (): Promise<PostModel[]> => {
    try {
      const response = await apiClient.get<PostsResponse>("/posts");
      return response.data.posts;
    } catch (error) {
      if (axios.isAxiosError(error) && error?.response?.status === 401) {
        await signOutAsync();
      }

      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError = error;
        throw new AppError(
          `Failed getPostsAsync(). Status: ${axiosError.response?.status}. Body: ${JSON.stringify(axiosError.response?.data)}`,
          axiosError
        );
      }

      logger.logException(new AppError("Failed getPostsAsync()", error));
      throw error;
    }
  };

  const value = useMemo<ApiClientContextType>(() => {
    return { getPostsAsync };
  }, []);

  return <ApiClientContext.Provider value={value}>{children}</ApiClientContext.Provider>;
};
