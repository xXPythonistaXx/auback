import { Ability } from '@casl/ability';
import { PermissionAction } from '@shared/enums';

export type PermissionObjectType = any;
export type AppAbility = Ability<[PermissionAction, PermissionObjectType]>;
export type RequiredPermission = [PermissionAction, PermissionObjectType];
// eslint-disable-next-line @typescript-eslint/ban-types
export type PermissionCondition = {};
