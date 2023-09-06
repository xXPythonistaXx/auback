import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { getModelToken } from '@nestjs/mongoose';
import { Employee, Job } from '@schemas';
import { UserService } from '../user/user.service';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { RoleService } from '../authorization/role/role.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { FacebookAuthService } from 'facebook-auth-nestjs';
import { GoogleAuthenticationService } from '../auth/google.service';
import { mock } from 'jest-mock-extended';
import { EventsService } from '../events/events.service';
import { PinoService } from '../logger/pino.service';
import { plainToClass } from 'class-transformer';
import { EmployeeUpdateDTO } from './dto/employee-update.dto';

jest.mock('@shared/helpers', () => ({
  generateRandomNumber: jest.fn(() => 123456),
  generateExpirationDate: jest.fn(() => new Date()),
}));

const employee = {
  cpf: '12345678901',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.due@mail.com',
  password: '123456',
};

const user = {
  _id: 'any_id',
  role: {
    name: 'employee',
  },
};

describe('EmployeeService', () => {
  let sut: EmployeeService;
  const mockedEventEmitters = mock<EventsService>() as {
    emitEvent: jest.Mock;
  };

  const EmployeeModelMock = {
    findOneAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue({}),
      }),
    }),
    findOne: jest.fn().mockReturnValue(null),
    create: jest.fn().mockReturnValue({
      populate: jest.fn(),
    }),
  };

  const UserServiceMock = {
    findByEmail: jest.fn().mockReturnValueOnce(null),
    createUser: jest.fn().mockReturnValue({
      _id: '123',
    }),
  };

  const RoleServiceMock = {
    findRoleByName: jest.fn().mockReturnValue({
      _id: '123',
      name: 'employee',
    }),
  };

  const mockedConfigService = mock<ConfigService>();
  const mockedMailService = mock<MailService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getModelToken(Employee.name),
          useValue: EmployeeModelMock,
        },
        {
          provide: getModelToken(Job.name),
          useValue: {},
        },
        {
          provide: UserService,
          useValue: UserServiceMock,
        },
        {
          provide: GoogleAuthenticationService,
          useValue: {},
        },
        {
          provide: FacebookAuthService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: mockedMailService,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: RoleService,
          useValue: RoleServiceMock,
        },
        {
          provide: AwsS3Service,
          useValue: {},
        },
        {
          provide: EventsService,
          useValue: mockedEventEmitters,
        },
        {
          provide: PinoService,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get<EmployeeService>(EmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('update academicBackgrounds', () => {
    it('should save with startDate/endDate attributes', async () => {
      UserServiceMock.findByEmail.mockReturnValueOnce({
        _id: '123',
        role: {
          _id: '123',
          name: 'employee',
        },
      });

      const payload = {
        academicBackgrounds: [
          {
            startDate: '12/2023',
            endDate: '12/2027',
            course: '640155ca9ba6e38e11087801',
            university: '640155c49ba6e38e110876e5',
            whereStudiedHighSchool: 'PUBLIC',
            scholarshipPercentage: 25,
          },
        ],
      };
      const parsed = plainToClass(EmployeeUpdateDTO, payload);
      await sut.updateEmployeeById('any_id', parsed);
      expect(EmployeeModelMock.findOneAndUpdate).toBeCalledWith(
        { id: 'any_id' },
        parsed,
        {
          lean: true,
          new: true,
        },
      );
    });
  });
  describe('signUp', () => {
    describe('when the employee is registered', () => {
      let error;

      beforeEach(async () => {
        sut.createEmployee = jest.fn(() =>
          Promise.resolve({
            ...employee,
            user,
          }),
        ) as any;
        mockedConfigService.get.mockReturnValue('http://localhost:3000');
        mockedMailService.sendEmailConfirmation.mockReturnValue(
          Promise.resolve(),
        );

        await sut
          .signup({
            ...employee,
          })
          .catch((err) => {
            error = err;
          });
      });

      it('should throw an error', () => {
        expect(error).toBeUndefined();
      });

      it('should dispatch event "client.created"', () => {
        expect(mockedEventEmitters.emitEvent).toHaveBeenCalledWith(
          'client.created',
          {
            ...employee,
            user,
          },
        );
      });
    });

    describe('when the employee is not registered', () => {
      it('should throw an error when the employee is not registered', async () => {
        sut.createEmployee = jest.fn(() => Promise.resolve(null)) as any;

        await expect(
          sut.signup({
            ...employee,
          }),
        ).rejects.toThrowError();
      });

      it('should not dispatch event "client.created"', async () => {
        sut.createEmployee = jest.fn(() => Promise.resolve(null)) as any;

        await sut
          .signup({
            ...employee,
          })
          .catch(() => {});

        expect(mockedEventEmitters.emitEvent).not.toHaveBeenCalled();
      });
    });
  });
});
