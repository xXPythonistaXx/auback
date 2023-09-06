import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { PermissionAction } from '@shared/enums';
import { PermissionObjectType } from '@shared/interfaces';
// action, object
export type RequiredPermission = [PermissionAction, PermissionObjectType];
export const PERMISSION_CHECKER_KEY = 'permission_checker_params_key';
export const CheckPermissions = (
  ...params: RequiredPermission[]
): CustomDecorator<string> => SetMetadata(PERMISSION_CHECKER_KEY, params);
