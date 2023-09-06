/* eslint-disable @typescript-eslint/unbound-method */
import { Ability } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Permission } from '@schemas';
import { PermissionAction } from '@shared/enums';
import {
  AppAbility,
  IPermissionPayload,
  ITokenParsePayload,
  IUserWithoutPass,
  PermissionCondition,
  PermissionObjectType,
} from '@shared/interfaces';
import { AuthorizationService } from './authorization.service';

interface CaslPermission {
  action: PermissionAction;
  subject: string;
  condition?: PermissionCondition;
}
@Injectable()
export class CaslAbilityFactory {
  constructor(private authorizationService: AuthorizationService) {}

  async createForUser(user: IUserWithoutPass): Promise<AppAbility> {
    const dbPermissions: IPermissionPayload[] =
      await this.authorizationService.findAllPermissionsOfUser(user._id);
    const caslPermissions: CaslPermission[] = dbPermissions.map((p) => ({
      action: p.action,
      subject: p.subject.name,
      conditions: Permission.parseCondition(p.condition, user),
    }));

    return new Ability<[PermissionAction, PermissionObjectType]>(
      caslPermissions,
    );
  }

  async createFromUserToken(user: ITokenParsePayload): Promise<AppAbility> {
    return this.createForUser(user as any);
  }
}
