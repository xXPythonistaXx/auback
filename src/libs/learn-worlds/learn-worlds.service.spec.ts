import * as nock from 'nock';
import { Test, TestingModule } from '@nestjs/testing';
import { LearnWorldsService } from './learn-worlds.service';
import { EmployeeService } from '@modules/employee/employee.service';
import { UserService } from '../../modules/user/user.service';
import { SetupTestModule } from '../../../test/helpers/setup-test';
import { ConfigService } from '@nestjs/config';

describe('LearnWorldsService', () => {
  let sut: LearnWorldsService;
  let configService: ConfigService;
  let learnWoldsApiUrl;

  const EmployeeServiceMocked = {
    findByUserId: jest.fn(),
    updateEmployeeById: jest.fn(),
    updateEmployeeByUserId: jest.fn(),
  };

  const userService = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    nock('https://learnworlds.com')
      .post('/oauth2/access_token')
      .times(99)
      .reply(201, {
        tokenData: {
          access_token: 'any_access_token',
          expires_in: 3600,
          token_type: 'Bearer',
        },
      });

    const module: TestingModule = await Test.createTestingModule({
      imports: SetupTestModule,
      providers: [
        LearnWorldsService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: EmployeeService,
          useValue: EmployeeServiceMocked,
        },
      ],
    }).compile();

    sut = module.get<LearnWorldsService>(LearnWorldsService);
    configService = module.get<ConfigService>(ConfigService);

    learnWoldsApiUrl = configService.get('LEARN_WORLDS_API_URL');
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe.skip('sso', () => {
    describe('when don`t provide user params', () => {
      it('should throw BadRequestException', async () => {
        EmployeeServiceMocked.findByUserId.mockResolvedValueOnce(null);

        await expect(sut.sso(null)).rejects.toThrow('Employee not found');
      });
    });

    describe('when provide user params', () => {
      let scope: nock.Scope;
      const userMock = {
        id: 'any_id',
        firstName: 'any_first_name',
        lastName: 'any_last_name',
        user: {
          email: 'any_email',
        },
      };

      beforeAll(() => {
        EmployeeServiceMocked.findByUserId.mockResolvedValueOnce(userMock);

        scope = nock('https://learnworlds.com')
          .post('/sso', {
            email: userMock.user.email,
            username: `${userMock.firstName}.${userMock.lastName}`,
            avatar: '',
            redirectUrl: 'https://any_url',
          })
          .reply(201, {
            success: true,
            url: 'https://any_url',
            user_id: 'any_user_id',
          });
      });

      afterAll(() => {
        nock.cleanAll();
      });

      it('should return a LearnWorldsSsoResponse', async () => {
        const result = await sut.sso('any_id');

        expect(scope.isDone()).toBeTruthy();

        expect(result).toEqual({
          redirectUrl: 'https://any_url',
        });
      });
    });
  });

  describe('syncUserProfile', () => {
    const user = {
      _id: 'any_user_id',
      email: 'any_mail@mail.com',
    };

    afterEach(() => {
      jest.clearAllMocks();
      nock.cleanAll();
    });

    describe('when not user by email', () => {
      it('should throw an error', async () => {
        await expect(sut.syncUserProfile(user.email)).rejects.toThrow();
      });
    });

    describe('when found user by email, but not return user from learn worlds api', () => {
      const expectDataGetResponse = {
        data: [
          {
            user: {
              ...user,
              email: 'invalid_mail@mail.com',
            },
          },
        ],
      };

      beforeAll(() => {
        userService.findByEmail.mockResolvedValue(user);

        nock(learnWoldsApiUrl)
          .get(`/v2/certificates?user_id=${user.email}`)
          .reply(200, expectDataGetResponse);
      });

      it('should request (GET) for learn worlds api', () => {
        sut
          .syncUserProfile(user.email)
          .catch((error) => expect(error).toBeDefined());
      });
    });

    describe('when found user by email', () => {
      const expectDataGetResponse = {
        data: [
          {
            user: user,
          },
        ],
      };

      beforeAll(() => {
        userService.findByEmail.mockResolvedValue(user);

        nock(learnWoldsApiUrl)
          .get(`/v2/certificates?user_id=${user.email}`)
          .reply(200, expectDataGetResponse);
      });

      it('should request (GET) for learn worlds api', async () => {
        await sut.syncUserProfile(user.email);

        expect(EmployeeServiceMocked.updateEmployeeByUserId).toBeCalledWith(
          user._id,
          {
            learnWorldsUserCourseCompleted: true,
          },
        );
      });
    });
  });
});
