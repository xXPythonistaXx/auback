import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Permission,
  PermissionSchema,
  Role,
  RoleSchema,
  Subject,
  SubjectSchema,
} from '@schemas';
import { PermissionsGuard } from '@shared/guards';
import { UserModule } from '../user/user.module';
import { AuthorizationService } from './authorization.service';
import { CaslAbilityFactory } from './casl-ability.factory';
import { PermissionService } from './permission/permission.service';
import { RoleService } from './role/role.service';
import { SubjectService } from './subject/subject.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
    UserModule,
  ],
  providers: [
    CaslAbilityFactory,
    PermissionsGuard,
    AuthorizationService,
    PermissionService,
    RoleService,
    SubjectService,
  ],
  exports: [
    CaslAbilityFactory,
    PermissionsGuard,
    AuthorizationService,
    PermissionService,
    RoleService,
    SubjectService,
  ],
})
export class AuthorizationModule {}
