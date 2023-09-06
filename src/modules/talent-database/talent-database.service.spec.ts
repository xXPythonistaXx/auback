import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from '../employee/employee.service';
import { TalentDatabaseService } from './talent-database.service';
import { rootMongooseTestModule } from 'test/helpers/in-memory-db';
import { ConfigModule } from '@nestjs/config';
import { GetAllTalentsQueryParamsDto } from './dto/get-all-talents-query-params.dto';
import {
  AcademicShift,
  HumanRace,
  Pcd,
  SexualOrientation,
} from '@shared/enums';
import { plainToClass } from 'class-transformer';

describe('TalentDatabaseService', () => {
  let service: TalentDatabaseService;

  const EmployeeServiceMock = {
    findAllEmployees: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), ConfigModule],
      providers: [
        TalentDatabaseService,
        {
          provide: EmployeeService,
          useValue: EmployeeServiceMock,
        },
      ],
    }).compile();

    service = module.get<TalentDatabaseService>(TalentDatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAllEmployees with the correct options', async () => {
    const params: any = {
      learnWorldsUserCourseCompleted: 'true',
      city: 'New York',
      toolId: ['{"tool": "123", "level": "BASIC"}'],
    };

    const expectedResult = null;

    const transformedParams = plainToClass(GetAllTalentsQueryParamsDto, params);

    EmployeeServiceMock.findAllEmployees.mockResolvedValue(expectedResult);

    const result = await service.findAllTalents(transformedParams);

    expect(EmployeeServiceMock.findAllEmployees).toHaveBeenCalledWith({
      select: [
        '-user',
        '-favoriteJobs',
        '_id',
        'isAvailableForChange',
        'firstName',
        'lastName',
        'profileImage',
        'learnWorldsUserCourseCompleted',
        'city',
        'about',
        'experiences.employer',
        'experiences.jobTitle',
        'experiences.startedAt',
        'experiences.finishedAt',
        'academicBackgrounds',
        'tools',
        'languages',
      ],
      limit: 5,
      page: 1,
      filterQuery: {
        learnWorldsUserCourseCompleted: true,
        city: 'New York',
        tools: {
          $all: [
            {
              $elemMatch: {
                _id: { $in: '123' },
                level: 'BASIC',
              },
            },
          ],
        },
      },
    });

    expect(result).toBe(expectedResult);
  });

  it('should call findAllEmployees without any avaliable param', async () => {
    const params = {};

    const expectedResult = null;

    EmployeeServiceMock.findAllEmployees.mockResolvedValue(expectedResult);

    const result = await service.findAllTalents(params);

    expect(EmployeeServiceMock.findAllEmployees).toHaveBeenCalledWith({
      select: [
        '-user',
        '-favoriteJobs',
        '_id',
        'isAvailableForChange',
        'firstName',
        'lastName',
        'profileImage',
        'learnWorldsUserCourseCompleted',
        'city',
        'about',
        'experiences.employer',
        'experiences.jobTitle',
        'experiences.startedAt',
        'experiences.finishedAt',
        'academicBackgrounds',
        'tools',
        'languages',
      ],
      filterQuery: undefined,
    });

    expect(result).toBe(expectedResult);
  });

  it('should call findAllEmployees with all avaliable params', async () => {
    const params: any = {
      learnWorldsUserCourseCompleted: 'true',
      sexualOrientation: [SexualOrientation.HOMOSEXUAL],
      humanRace: [HumanRace.BROWN],
      city: 'New York',
      pcd: [Pcd.PHYSICAL_IMPAIRED],
      toolId: ['{"tool": "123", "level": "BASIC"}'],
      course_id: ['{"course": "789", "period": 1 }'],
      universityId: ['987'],
      scholarshipPercentage: '50',
      languagesId: ['{"language": "123", "level": "FLUENT"}'],
      stateId: '543',
      period: ['1', '2'],
      shift: [AcademicShift.AFTERNOON],
    };

    const expectedResult = null;

    EmployeeServiceMock.findAllEmployees.mockResolvedValue(expectedResult);
    const transformedParams = plainToClass(GetAllTalentsQueryParamsDto, params);
    const result = await service.findAllTalents(transformedParams);

    expect(EmployeeServiceMock.findAllEmployees).toHaveBeenCalledWith({
      select: [
        '-user',
        '-favoriteJobs',
        '_id',
        'isAvailableForChange',
        'firstName',
        'lastName',
        'profileImage',
        'learnWorldsUserCourseCompleted',
        'city',
        'about',
        'experiences.employer',
        'experiences.jobTitle',
        'experiences.startedAt',
        'experiences.finishedAt',
        'academicBackgrounds',
        'tools',
        'languages',
      ],
      limit: 5,
      page: 1,
      filterQuery: {
        $or: [
          {
            academicBackgrounds: {
              $elemMatch: {
                $or: [
                  {
                    period: {
                      $gte: 1,
                    },
                  },
                  {
                    startDate: {
                      $lte: expect.any(Date),
                    },
                  },
                ],
                course: {
                  $in: '789',
                },
              },
            },
          },
        ],
        learnWorldsUserCourseCompleted: true,
        'about.sexualOrientation': { $in: ['HOMOSEXUAL'] },
        'about.humanRace': { $in: ['BROWN'] },
        city: 'New York',
        'about.pcd': { $in: ['PHYSICAL_IMPAIRED'] },
        tools: {
          $all: [
            {
              $elemMatch: {
                _id: { $in: '123' },
                level: 'BASIC',
              },
            },
          ],
        },
        academicBackgrounds: {
          $elemMatch: {
            university: { $in: ['987'] },
            scholarshipPercentage: 50,
            period: { $in: [1, 2] },
            shift: { $in: ['AFTERNOON'] },
          },
        },
        languages: {
          $all: [
            {
              $elemMatch: {
                _id: { $in: '123' },
                speaking: 'FLUENT',
              },
            },
          ],
        },
        state: {
          _id: '543',
        },
      },
    } as any);

    expect(result).toBe(expectedResult);
  });
});
