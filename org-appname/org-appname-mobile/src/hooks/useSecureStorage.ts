import * as SecureStore from "expo-secure-store";

interface SecureStorageService {
  getItemAsync: <T>(key: string) => Promise<T | null>;
  setItemAsync: (key: string, value: unknown) => Promise<void>;
  removeItemAsync: (key: string) => Promise<void>;
}

const useSecureStorage = (): SecureStorageService => {
  async function getItemAsync<T>(key: string): Promise<T | null> {
    const jsonValue = await SecureStore.getItemAsync(key);

    if (!jsonValue) {
      return null;
    }

    try {
      const result: T = JSON.parse(jsonValue);
      return result;
    } catch {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  }

  const setItemAsync = async (key: string, value: unknown): Promise<void> => {
    if (value === null || value === undefined) {
      throw new Error(`Cannot save null/undefined value to secureStorage. key: ${key}`);
    }

    await SecureStore.setItemAsync(key, JSON.stringify(value));
  };

  const removeItemAsync = async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  };

  return { getItemAsync, setItemAsync, removeItemAsync };
};

export default useSecureStorage;

