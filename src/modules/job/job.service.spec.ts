/* eslint-disable import/namespace */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { JobSendInvitesDTO } from './dto/job-send-invites.dto';
import { getModelToken } from '@nestjs/mongoose';
import { Job, JobStep } from '@schemas';
import { Connection } from 'mongoose';
import { EmployeeService } from '@modules/employee/employee.service';
import { EmployerService } from '@modules/employer/employer.service';
import { AwsS3Service } from '@modules/aws-s3/aws-s3.service';
import { ConfigModule } from '@nestjs/config';
import { rootMongooseTestModule } from 'test/helpers/in-memory-db';
import { MailService } from '@modules/mail/mail.service';
import { JobApplyDTO } from './dto/job-apply.dto';
import { PinoService } from '../logger/pino.service';
import * as moment from 'moment-timezone';
import * as profileValidate from '../../shared/helpers/validate-profile-completed.helper';
import { UpdateJobImageDTO } from './dto/job-update-image.dto';
import { plainToClass } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { PushStartService } from '@libs/push-start/push-start.service';
import { PsTestResult } from 'src/schemas/ps-test-result.schema';
import { MacroJob } from 'src/schemas/macro-job/macro-job.schema';
import { CourseService } from '@modules/course/course.service';

describe('JobService', () => {
  let sut: JobService;

  const S3ServiceMock = {
    uploadMedia: jest.fn().mockReturnValue({ location: 'ok', key: 'ok' }),
  };

  const CourseServiceMock = {
    findAll: jest.fn(),
  };

  const JobModelMock = {
    findOne: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      }),
    }),
    aggregate: jest.fn().mockReturnValue({
      limit: jest.fn(),
    }),
  };

  const EmployeeServiceMock = {
    findById: jest.fn(),
  };

  const MailServiceMock = {
    sendJobInvite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), ConfigModule],
      providers: [
        JobService,
        PinoService,
        PushStartService,
        {
          provide: CourseService,
          useValue: CourseServiceMock,
        },
        {
          provide: getModelToken(Job.name),
          useValue: JobModelMock,
        },
        {
          provide: getModelToken(PsTestResult.name),
          useValue: {},
        },
        {
          provide: getModelToken(JobStep.name),
          useValue: {},
        },
        {
          provide: getModelToken(MacroJob.name),
          useValue: {},
        },
        {
          provide: Connection,
          useValue: {},
        },
        {
          provide: EmployeeService,
          useValue: EmployeeServiceMock,
        },
        {
          provide: EmployerService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: MailServiceMock,
        },
        {
          provide: AwsS3Service,
          useValue: S3ServiceMock,
        },
      ],
    }).compile();

    sut = module.get<JobService>(JobService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('updateJobImage', () => {
    it('should throw BadRequestException when jobImage is missing', async () => {
      const id = 'jobId';
      const newData: any = {};
      const payload = plainToClass(UpdateJobImageDTO, newData);

      await expect(sut.updateJobImage(id, payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update jobImage', async () => {
      const id = 'jobId';
      const newData: any = {
        jobImage: 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
      };
      const payload = plainToClass(UpdateJobImageDTO, newData);
      const result = await sut.updateJobImage(id, payload);
      expect(S3ServiceMock.uploadMedia).toHaveBeenCalledWith(
        payload.jobImage,
        expect.any(String),
      );
      expect(result).toEqual({});
    });
  });

  describe('applyToJob', () => {
    const anyJobId = 'any_job_id';
    const anyCandidateId = 'any_candidate_id';
    const anyData = {} as JobApplyDTO;

    describe('when apply job and not found candidate', () => {
      beforeAll(() => {
        EmployeeServiceMock.findById.mockResolvedValue(null);
      });

      it('should throw an error', async () => {
        let error = null;
        try {
          await sut.applyToJob(anyJobId, anyCandidateId, anyData);
        } catch (err) {
          error = err;
        }

        expect(error).not.toBeNull();
        expect(error.message).toBe('Candidato não encontrado.');
      });
    });

    describe('when apply job and not found job', () => {
      beforeAll(() => {
        EmployeeServiceMock.findById.mockResolvedValue({ id: anyJobId });
        jest
          .spyOn(profileValidate, 'validateProfileHasCompleted')
          .mockResolvedValue({
            hasCompletedProfile: true,
          });
      });

      it('should throw an error', async () => {
        let error = null;
        try {
          await sut.applyToJob(anyJobId, anyCandidateId, anyData);
        } catch (err) {
          error = err;
        }

        expect(error).not.toBeNull();
        expect(error.message).toBe('Vaga não encontrada');
      });
    });

    describe('when apply job and finishAt is before at current time', () => {
      const pastDateTime = moment().subtract(1, 'day');
      const job = {
        finishAt: pastDateTime,
      } as any;

      beforeAll(() => {
        EmployeeServiceMock.findById.mockResolvedValue({ id: anyJobId });
      });

      it('should throw an error', async () => {
        jest.spyOn(sut, 'findOne').mockResolvedValue(job);
        let error = null;
        try {
          await sut.applyToJob(anyJobId, anyCandidateId, anyData);
        } catch (err) {
          error = err;
        }

        expect(error).not.toBeNull();
        expect(error.message).toBe('Vaga esta encerrada.');
      });
    });

    describe('when apply job and candidate not finish ', () => {
      const pastDateTime = moment().subtract(10, 'day');
      const job = {
        finishAt: pastDateTime,
      } as any;

      beforeAll(() => {
        EmployeeServiceMock.findById.mockResolvedValue({
          id: anyJobId,
          learnWorldsUserCourseCompleted: false,
        });
        JobModelMock.findOne.mockResolvedValue(job);
      });

      it('should throw an error', async () => {
        jest.spyOn(sut, 'findOne').mockResolvedValue(job);
        let error = null;
        try {
          await sut.applyToJob(anyJobId, anyCandidateId, anyData);
        } catch (err) {
          error = err;
        }

        expect(error).not.toBeNull();
        expect(error.message).toBe('Vaga esta encerrada.');
      });
    });
  });

  describe('sendJobInvites', () => {
    const mockJob = {
      _id: 'jobId',
      area: 'Software Engineering',
    };

    const mockCandidate = {
      _id: 'candidateId',
      user: {
        email: 'john.doe@example.com',
      },
      firstName: 'John',
    };

    beforeEach(() => {
      JobModelMock.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockJob),
        }),
      });

      EmployeeServiceMock.findById.mockResolvedValue(mockCandidate);
    });

    it('should send job invites to all candidates', async () => {
      const payload: JobSendInvitesDTO = {
        jobId: 'jobId',
        candidatesId: ['candidateId'],
      };

      await sut.sendJobInvites(payload);

      expect(JobModelMock.findOne).toHaveBeenCalledWith({ _id: 'jobId' });
      expect(EmployeeServiceMock.findById).toHaveBeenCalledWith('candidateId');
    });

    describe('when job is not found', () => {
      beforeEach(() => {
        JobModelMock.findOne.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        });
        EmployeeServiceMock.findById.mockResolvedValue(mockCandidate);
      });

      it('should throw NotFoundException ', async () => {
        const payload: JobSendInvitesDTO = {
          jobId: 'invalidJobId',
          candidatesId: ['candidateId'],
        };

        await expect(sut.sendJobInvites(payload)).rejects.toThrowError(
          `A vaga com id: ${payload.jobId} não existe.`,
        );
        expect(JobModelMock.findOne).toHaveBeenCalledWith({
          _id: 'invalidJobId',
        });
        expect(EmployeeServiceMock.findById).not.toHaveBeenCalled();
        expect(MailServiceMock.sendJobInvite).not.toHaveBeenCalled();
      });
    });

    describe('when candidate is not found', () => {
      beforeEach(() => {
        JobModelMock.findOne.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockJob),
          }),
        });

        EmployeeServiceMock.findById.mockResolvedValue(null);
      });

      it('should skip sending invite when candidate is not found', async () => {
        const payload: JobSendInvitesDTO = {
          jobId: 'jobId',
          candidatesId: ['invalidCandidateId'],
        };
        await sut.sendJobInvites(payload);
        expect(JobModelMock.findOne).toHaveBeenCalledWith({ _id: 'jobId' });
        expect(EmployeeServiceMock.findById).toHaveBeenCalledWith(
          'invalidCandidateId',
        );
        expect(MailServiceMock.sendJobInvite).not.toHaveBeenCalled();
      });
    });
  });

  describe('getSuggestionJobs', () => {
    it('should return suggested jobs', async () => {
      JobModelMock.aggregate.mockReturnValue({
        limit: jest.fn().mockResolvedValue([{}]),
      });

      const jobId = 'exampleJobId';
      const params = { limit: 5, q: 'exampleQuery' };

      const result = await sut.getSuggestionJobs(jobId, params);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should limit the number of jobs based on the provided limit parameter', async () => {
      JobModelMock.aggregate.mockReturnValue({
        limit: jest.fn().mockResolvedValue([1, 2, 3]),
      });

      const jobId = 'exampleJobId';
      const params = { limit: 3 };

      const result = await sut.getSuggestionJobs(jobId, params);

      expect(result.length).toBe(3);
    });

    it('should match the expected MongoDB aggregation pipeline', async () => {
      const expectedResult = [{}];

      JobModelMock.aggregate.mockReturnValue({
        limit: jest.fn().mockResolvedValue(expectedResult),
      });

      const jobId = 'exampleJobId';
      const params = { limit: 5 };

      const result = await sut.getSuggestionJobs(jobId, params);

      expect(result).toEqual(expectedResult);
    });
  });
});
