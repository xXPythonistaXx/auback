import { Permission } from '@schemas';

export interface IRole {
  name: string;
  permissions?: Permission[];
}

export interface IRoleUpdate extends Partial<Omit<IRole, 'permissions'>> {
  permissions?: string[];
}
export interface IRoleCreate extends Omit<IRole, 'permissions'> {
  permissions?: string[];
}

export interface IRolePayload extends IRole {
  _id: string;
}
