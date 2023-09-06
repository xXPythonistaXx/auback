import { Role } from '@schemas';

export interface IUser {
  email: string;
  password?: string;
  googleId?: string;
  facebookId?: string;
  resetPasswordCode?: string;
  resetPasswordExpiration?: string;
  emailConfirmed?: boolean;
  emailConfirmationCode?: string;
  emailConfirmationExpiration?: string;
  role: Role;
}

export interface IUserUpdate extends Partial<Omit<IUser, 'email' | 'role'>> {
  role?: string;
}
export interface IUserCreate extends Omit<IUser, 'role'> {
  role: string;
}

export interface IUserPayload extends IUser {
  _id: string;
}

export type IUserWithoutPass = Omit<IUserPayload, 'password'>;
