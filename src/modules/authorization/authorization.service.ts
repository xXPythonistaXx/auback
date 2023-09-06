import { Injectable } from '@nestjs/common';
import { IPermissionPayload } from '@shared/interfaces';
import { UserService } from '../user/user.service';
import { RoleService } from './role/role.service';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  async findAllPermissionsOfUser(id: string): Promise<IPermissionPayload[]> {
    const user = await this.userService.findById(id);
    const { permissions } = await this.roleService.findRoleById(user.role._id);
    return permissions;
  }
}
