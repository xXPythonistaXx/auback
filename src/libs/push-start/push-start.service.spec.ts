import { PsTestResult } from 'src/schemas/ps-test-result.schema';
import { Role } from './../../schemas/role.schema';
import { EmployeeService } from './../../modules/employee/employee.service';
import { PinoService } from './../../modules/logger/pino.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PushStartService } from './push-start.service';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Job, JobStep } from '@schemas';
import { getModelToken } from '@nestjs/mongoose';
import { JobService } from '@modules/job/job.service';

describe('PushStartService', () => {
  let pushStartService: PushStartService;
  let configService: ConfigService;
  let logger: PinoService;

  const EmployeeServiceMocked = {
    findById: jest.fn(),
    updateEmployeeById: jest.fn(),
  };

  const JobStepMock = {
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

  const JobMock = {
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

  const PsTestResultMock = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Job.name),
          useValue: JobMock,
        },
        {
          provide: getModelToken(JobStep.name),
          useValue: JobStepMock,
        },
        {
          provide: getModelToken(PsTestResult.name),
          useValue: PsTestResultMock,
        },
        {
          provide: JobService,
          useValue: JobMock,
        },
        PushStartService,
        PinoService,
        ConfigService,
        {
          provide: EmployeeService,
          useValue: EmployeeServiceMocked,
        },
      ],
    }).compile();

    pushStartService = module.get<PushStartService>(PushStartService);
    configService = module.get<ConfigService>(ConfigService);
    logger = module.get<PinoService>(PinoService);
  });

  describe('createTest', () => {
    it('should create a test and return redirect URL', async () => {
      const employeeId = 'employee-id';
      const testId = '123';

      const role: Role = {
        _id: 'role-id',
        name: 'employee',
        permissions: [],
      };

      const jobMock = {
        _id: 'test-job',
        title: 'PushStart Integration',
      };

      const employee = {
        _id: employeeId,
        firstName: 'John',
        lastName: 'Doe',
        user: {
          _id: 'user-id',
          email: 'john@example.com',
          role: role,
        },
      };

      const pushStartTest = {
        url: 'https://pushstart-test-url.com',
        status: 'created',
      };

      EmployeeServiceMocked.findById.mockResolvedValueOnce(employee);
      JobMock.findOne.mockResolvedValueOnce(jobMock);
      jest.spyOn(configService, 'get' as any).mockReturnValue('fake-token');
      jest.spyOn(logger, 'log');

      const axiosResponse = {
        data: pushStartTest,
      };

      const axiosMock = jest.spyOn(axios, 'create' as any);
      axiosMock.mockReturnValue({
        post: jest.fn().mockResolvedValue(axiosResponse),
      } as any);

      const result = await pushStartService.createTest(employeeId, testId);

      expect(result).toEqual({
        redirectUrl: pushStartTest.url,
        status: pushStartTest.status,
      });
      expect(EmployeeServiceMocked.findById).toHaveBeenCalledWith(employeeId);
      expect(configService.get).toHaveBeenCalledWith('PUSH_START_TOKEN');
      expect(logger.log).toHaveBeenCalledWith(
        `PUSH START - Test created to user ${employeeId}`,
      );
      expect(axiosMock).toHaveBeenCalledWith({
        baseURL: pushStartService.baseApiUrl,
        headers: {
          Authorization: `Bearer fake-token`,
        },
      });
    });

    it('should throw NotFoundException if employee is not found', async () => {
      const employeeId = 'non-existent-id';
      EmployeeServiceMocked.findById.mockResolvedValue(undefined);

      await expect(() =>
        pushStartService.createTest(employeeId, '123'),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
