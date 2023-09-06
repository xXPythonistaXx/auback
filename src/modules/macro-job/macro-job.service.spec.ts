import { Test, TestingModule } from '@nestjs/testing';
import { MacroJobService } from './macro-job.service';
import { getModelToken } from '@nestjs/mongoose';
import { Job, MacroJob } from '@schemas';
import { EmployerService } from '@modules/employer/employer.service';

describe('MacroJobService', () => {
  let service: MacroJobService;

  beforeEach(async () => {
    const MacroJobMock = {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MacroJobService,
        {
          provide: getModelToken(MacroJob.name),
          useValue: MacroJobMock,
        },
        {
          provide: getModelToken(Job.name),
          useValue: JobMock,
        },
        {
          provide: EmployerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MacroJobService>(MacroJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
