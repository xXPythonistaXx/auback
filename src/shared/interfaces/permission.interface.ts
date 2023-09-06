import { Subject } from '@schemas';
import { PermissionAction } from '@shared/enums';

export interface IPermission {
  action: PermissionAction;
  // eslint-disable-next-line @typescript-eslint/ban-types
  condition?: Object;
  subject: Subject;
}

export type IPermissionUpdate = Partial<IPermission>;
export interface IPermissionCreate extends Omit<IPermission, 'subject'> {
  subject: string;
}

export interface IPermissionPayload extends IPermission {
  _id: string;
}
