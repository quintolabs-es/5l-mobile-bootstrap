import { SignInModel, UserModel } from "../types/authTypes";
import useLocalStorage from "./useLocalStorage";
import useSecureStorage from "./useSecureStorage";
import { useLogger } from "../providers/LoggerProvider";

interface LocalLoginStorageService {
  getAsync: () => Promise<SignInModel | null>;
  saveAsync: (loginModel: SignInModel) => Promise<void>;
  removeAsync: () => Promise<void>;
  updateUserProfileAsync: (updatedUser: UserModel) => Promise<void>;
}

const SIGN_IN_KEY = "signInInfo";

const isValidSignInModel = (model: SignInModel | null): model is SignInModel => {
  return !!model?.tokens?.accessToken && !!model?.tokens?.refreshToken && !!model?.user;
};

const useLocalLoginStorage = (): LocalLoginStorageService => {
  const logger = useLogger();
  const localStorage = useLocalStorage();
  const secureStorage = useSecureStorage();

  const getAsync = async (): Promise<SignInModel | null> => {
    const secure = await secureStorage.getItemAsync<SignInModel>(SIGN_IN_KEY);
    if (secure) {
      if (!isValidSignInModel(secure)) {
        logger.logDebug(
          `Found invalid signInModel in secure storage. Removing and returning null.`
        );
        await secureStorage.removeItemAsync(SIGN_IN_KEY);
        return null;
      }
      return secure;
    }

    // Migration from legacy AsyncStorage key (if present)
    const legacy = await localStorage.getItemAsync<SignInModel>(SIGN_IN_KEY);
    if (!legacy) return null;

    if (!isValidSignInModel(legacy)) {
      logger.logDebug(`Found invalid signInModel in local storage. Removing and returning null.`);
      await localStorage.removeItemAsync(SIGN_IN_KEY);
      return null;
    }

    await secureStorage.setItemAsync(SIGN_IN_KEY, legacy);
    await localStorage.removeItemAsync(SIGN_IN_KEY);
    logger.logDebug("Migrated signInModel from AsyncStorage to SecureStore");

    return legacy;
  };

  const saveAsync = async (loginModel: SignInModel): Promise<void> => {
    await secureStorage.setItemAsync(SIGN_IN_KEY, loginModel);
    await localStorage.removeItemAsync(SIGN_IN_KEY);
  };

  const removeAsync = async (): Promise<void> => {
    await secureStorage.removeItemAsync(SIGN_IN_KEY);
    await localStorage.removeItemAsync(SIGN_IN_KEY);
  };

  const updateUserProfileAsync = async (updatedUser: UserModel): Promise<void> => {
    const current = await getAsync();
    if (!current) return;
    current.user = updatedUser;
    await saveAsync(current);
  };

  return { getAsync, saveAsync, removeAsync, updateUserProfileAsync };
};

export default useLocalLoginStorage;

