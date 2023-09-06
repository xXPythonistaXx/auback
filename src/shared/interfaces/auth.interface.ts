export interface ITokenPayload {
  sub: string;
  entityId: string;
  email: string;
  role: string;
}

export interface ITokenParsePayload {
  _id: string;
  entityId: string;
  email: string;
  role: string;
}

export interface ISignin {
  _id: string;
  entityId?: string;
  email: string;
  role: string;
}

export interface ISigninPayload {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleValidationPayload {
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  googleId: string;
}

export interface GoogleProfile {
  emails: { value: string }[];
  name: { givenName: string; familyName: string };
  photos: { value: string }[];
  id: string;
}

export interface ConfirmEmailPayload {
  active: boolean;
}
