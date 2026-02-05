export type TokensModel = {
  accessToken: string;
  refreshToken: string;
};

export type UserModel = {
  id: string;
  email: string | null;
  nickName: string;
  givenName: string | null;
  familyName: string | null;
  authProvider: "google" | "apple";
  idInProvider: string;
};

export type SignInModel = {
  tokens: TokensModel;
  user: UserModel;
};

export type GoogleAuthUser = {
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    givenName: string | null;
    familyName: string | null;
  };
};

export type AppleAuthUser = {
  idToken: string;
  user: {
    id: string;
    email: string | null;
    nickName: string | null;
    givenName: string | null;
    familyName: string | null;
  };
};

