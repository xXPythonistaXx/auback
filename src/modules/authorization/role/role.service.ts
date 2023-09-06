import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from '@schemas';
import { ErrorCodes } from '@shared/enums';
import { IRoleCreate, IRolePayload } from '@shared/interfaces';
import { Model } from 'mongoose';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findRoleById(id: string): Promise<IRolePayload> {
    return this.roleModel
      .findById(id)
      .populate({
        path: 'permissions',
        populate: {
          path: 'subject',
          model: 'Subject',
        },
      })
      .lean();
  }

  async findRoleByName(name: string): Promise<IRolePayload> {
    return this.roleModel
      .findOne({ name })
      .populate({
        path: 'permissions',
        populate: {
          path: 'subject',
          model: 'Subject',
        },
      })
      .lean();
  }

  async createRole(role: IRoleCreate) {
    const roleExists = await this.roleModel.exists({ name: role.name });
    if (roleExists)
      throw new BadRequestException({
        errorCode: ErrorCodes.DATA_ALREADY_EXISTS,
        message: 'Role já cadastrada!',
      });

    const newRole = await this.createAllRoles([role]);
    return newRole;
  }

  async createRoles(roles: IRoleCreate[]) {
    const rolesExists: string[] = [];
    const newRoles: IRoleCreate[] = [];
    await Promise.all(
      roles.map(async (role) => {
        const roleExist = await this.roleModel.exists({ name: role.name });
        if (roleExist) {
          rolesExists.push(role.name);
        } else {
          newRoles.push(role);
        }
      }),
    );
    if (newRoles) {
      const createdRoles = await this.createAllRoles(newRoles);
      return createdRoles.save();
    }
    if (rolesExists.length > 0)
      throw new BadRequestException({
        errorCode: ErrorCodes.DATA_ALREADY_EXISTS,
        message: `Role ${rolesExists[0]} já cadastrada!`,
      });
  }

  private async createAllRoles(roles: IRoleCreate[]) {
    const newRoles = new this.roleModel(roles);
    return newRoles.save();
  }
}
