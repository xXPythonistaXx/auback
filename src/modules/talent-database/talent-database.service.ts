import { Injectable } from '@nestjs/common';
import {
  IEmployee,
  IEmployeePayload,
  PaginateOptions,
} from '@shared/interfaces';
import { EmployeeService } from '../employee/employee.service';
import { GetAllTalentsQueryParamsDto } from './dto/get-all-talents-query-params.dto';
import {
  endOfYear,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';

@Injectable()
export class TalentDatabaseService {
  constructor(private readonly employeeService: EmployeeService) {}

  async findAllTalents(params?: GetAllTalentsQueryParamsDto) {
    const talentDefaultPaginateOptions: PaginateOptions<IEmployee> = {
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
      page: params.page,
      limit: params.limit,
    };

    const filterQuery = this.buildQueryFilter(params);

    const options = {
      filterQuery,
      ...talentDefaultPaginateOptions,
    };

    return this.employeeService.findAllEmployees(options);
  }

  buildQueryFilter(params?: GetAllTalentsQueryParamsDto) {
    let query;

    if (!params) {
      return {};
    }

    if (params?.isAvaliableForChange) {
      query = {
        ...query,
        isAvailableForChange: params.isAvaliableForChange,
      };
    }
    if (params?.learnWorldsUserCourseCompleted) {
      query = {
        ...query,
        learnWorldsUserCourseCompleted: true,
      };
    }

    if (params?.sexualOrientation?.length) {
      query = {
        ...query,
        'about.sexualOrientation': { $in: params?.sexualOrientation },
      };
    }

    if (params?.humanRace?.length) {
      query = {
        ...query,
        'about.humanRace': { $in: params?.humanRace },
      };
    }

    if (params?.city?.length) {
      query = {
        ...query,
        city: params?.city,
      };
    }

    if (params?.pcd?.length) {
      query = {
        ...query,
        'about.pcd': { $in: params.pcd },
      };
    }

    if (params?.toolId?.length) {
      query = {
        ...query,
        tools: {
          $all: params.toolId.map((tool: any) => ({
            $elemMatch: {
              _id: { $in: tool.tool },
              level: tool.level,
            },
          })),
        },
      };
    }

    if (params?.course_id?.length) {
      query = {
        ...query,
        $or: params.course_id.map((course) => {
          const currentHalfYear =
            new Date().getMonth() + 1 <= 6
              ? startOfMonth(startOfYear(new Date()))
              : startOfMonth(
                  subMonths(new Date(), new Date().getMonth() + 1 - 7),
                );
          const desireedDate =
            course.period > 0
              ? subMonths(subMonths(currentHalfYear, course.period * 6), 2)
              : subYears(new Date(), 10);

          return {
            academicBackgrounds: {
              $elemMatch: {
                course: {
                  $in: course.course,
                },
                $or: [
                  {
                    period: {
                      $gte: course.period,
                    },
                  },
                  {
                    startDate: {
                      $lte: desireedDate,
                    },
                  },
                ],
              },
            },
          };
        }),
      };
    }

    if (params?.universityId?.length) {
      if (query?.academicBackgrounds) {
        query.academicBackgrounds.$elemMatch = {
          ...query.academicBackgrounds.$elemMatch,
          university: {
            $in: params.universityId,
          },
        };
      } else {
        query = {
          ...query,
          academicBackgrounds: {
            $elemMatch: {
              university: {
                $in: params.universityId,
              },
            },
          },
        };
      }
    }

    if (params?.scholarshipPercentage) {
      if (query?.academicBackgrounds) {
        query.academicBackgrounds.$elemMatch = {
          ...query.academicBackgrounds.$elemMatch,
          scholarshipPercentage: params.scholarshipPercentage,
        };
      } else {
        query = {
          ...query,
          academicBackgrounds: {
            $elemMatch: {
              scholarshipPercentage: params.scholarshipPercentage,
            },
          },
        };
      }
    }

    if (params?.languagesId?.length) {
      query = {
        ...query,
        languages: {
          $all: params.languagesId.map((language: any) => ({
            $elemMatch: {
              _id: { $in: language.language },
              speaking: language.level,
            },
          })),
        },
      };
    }

    if (params?.stateId?.length) {
      query = {
        ...query,
        state: {
          _id: params.stateId,
        },
      };
    }

    if (params?.name?.length) {
      query = {
        ...query,
        $expr: {
          $regexMatch: {
            input: { $concat: ['$firstName', ' ', '$lastName'] },
            regex: params?.name,
            options: 'i',
          },
        },
      };
    }

    if (params?.period?.length) {
      if (query?.academicBackgrounds) {
        query.academicBackgrounds.$elemMatch = {
          ...query.academicBackgrounds.$elemMatch,
          period: {
            $in: params.period,
          },
        };
      } else {
        query = {
          ...query,
          academicBackgrounds: {
            $elemMatch: {
              period: {
                $in: params.period,
              },
            },
          },
        };
      }
    }
    if (params?.shift?.length) {
      if (query?.academicBackgrounds) {
        query.academicBackgrounds.$elemMatch = {
          ...query.academicBackgrounds.$elemMatch,
          shift: {
            $in: params.shift,
          },
        };
      } else {
        query = {
          ...query,
          academicBackgrounds: {
            $elemMatch: {
              shift: {
                $in: params.shift,
              },
            },
          },
        };
      }
    }

    const birthDateMinDate = startOfYear(subYears(new Date(), params.AgeMin));

    const birthDateMaxDate = startOfYear(subYears(new Date(), params.AgeMax));

    if (params?.AgeMin && params?.AgeMax) {
      query = {
        ...query,
        birthDate: {
          $gte: birthDateMaxDate,
          $lte: endOfYear(birthDateMinDate),
        },
      };
    } else if (params?.AgeMin) {
      query = {
        ...query,
        birthDate: {
          $gte: birthDateMinDate,
          $lt: endOfYear(birthDateMinDate),
        },
      };
    } else if (params?.AgeMax) {
      query = {
        ...query,
        birthDate: {
          $gte: birthDateMaxDate,
        },
      };
    }

    return query;
  }

  findTalentById(id: string): Promise<IEmployeePayload> {
    return this.employeeService.findById(id);
  }
}
