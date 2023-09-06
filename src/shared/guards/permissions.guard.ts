import { Ability, AbilityTuple, MongoQuery, Subject } from '@casl/ability';
import { AnyObject } from '@casl/ability/dist/types/types';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PERMISSION_CHECKER_KEY } from '@shared/decorators';
import { ErrorCodes } from '@shared/enums';
import { ITokenParsePayload, RequiredPermission } from '@shared/interfaces';
import { CaslAbilityFactory } from '../../modules/authorization/casl-ability.factory';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: CaslAbilityFactory,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const requiredPermissions =
      this.reflector.get<RequiredPermission[]>(
        PERMISSION_CHECKER_KEY,
        context.getHandler(),
      ) || [];
    const req = context.switchToHttp().getRequest();
    const userReq = req.user as ITokenParsePayload;
    if (!userReq)
      throw new BadRequestException({
        errorCode: ErrorCodes.UNAUTHORIZED,
        message: 'Usuário não autorizado.',
      });
    const user = await this.userService.findById(userReq._id);
    const ability = await this.abilityFactory.createForUser(user);
    return requiredPermissions.every((permission) =>
      this.isAllowed(ability, permission),
    );
  }

  private isAllowed(
    ability: Ability<AbilityTuple<string, Subject>, MongoQuery<AnyObject>>,
    permission: RequiredPermission,
  ): boolean {
    return ability.can(...permission);
  }
}
