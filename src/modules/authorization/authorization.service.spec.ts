import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from './authorization.service';
import { UserService } from '../user/user.service';
import { RoleService } from './role/role.service';

describe('AuthorizationService', () => {
  let sut: AuthorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: RoleService,
          useValue: {},
        },
      ],
    }).compile();

    sut = module.get<AuthorizationService>(AuthorizationService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });
});
