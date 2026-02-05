import AsyncStorage from "@react-native-async-storage/async-storage";

interface LocalStorageService {
  getItemAsync: <T>(key: string) => Promise<T | null>;
  setItemAsync: (key: string, value: unknown) => Promise<void>;
  removeItemAsync: (key: string) => Promise<void>;
}

const useLocalStorage = (): LocalStorageService => {
  async function getItemAsync<T>(key: string): Promise<T | null> {
    const jsonValue = await AsyncStorage.getItem(key);
    if (!jsonValue) return null;

    try {
      return JSON.parse(jsonValue) as T;
    } catch {
      await AsyncStorage.removeItem(key);
      return null;
    }
  }

  const setItemAsync = async (key: string, value: unknown): Promise<void> => {
    if (value === null || value === undefined) {
      throw new Error(`Cannot save null/undefined value to localStorage. key: ${key}`);
    }
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const removeItemAsync = async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  };

  return { getItemAsync, setItemAsync, removeItemAsync };
};

export default useLocalStorage;

