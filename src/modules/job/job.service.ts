/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  Job,
  JobDocument,
  JobStep,
  JobStepDocument,
  MacroJob,
  MacroJobDocument,
} from '@schemas';
import {
  DefaultRoles,
  ErrorCodes,
  JobStepCandidateStatus,
} from '@shared/enums';
import { NotFoundException } from '@shared/exceptions';
import { parseIdStringToObjectId } from '@shared/helpers';
import {
  AggregatePaginateModel,
  defaultPaginateOptions,
  IJob,
  IJobCreate,
  IJobStepCandidateUpdate,
  IJobStepCreate,
  IJobStepUpdate,
  IJobUpdate,
  PaginateOptions,
} from '@shared/interfaces';
import { ObjectId } from 'bson';
import { v4 as uuid } from 'uuid';
import {
  ClientSession,
  Connection,
  Model,
  PaginateModel,
  PipelineStage,
  Types,
} from 'mongoose';
import { EmployeeService } from '../employee/employee.service';
import { EmployerService } from '../employer/employer.service';
import { MailService } from '../mail/mail.service';
import { ApproveReproveCandidateDTO } from './dto/approve-repprove-candidate.dto';
import { ApproveReproveCandidatesDTO } from './dto/approve-repprove-candidates.dto';
import { JobApplyDTO } from './dto/job-apply.dto';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { ConfigService } from '@nestjs/config';
import { JobSendInvitesDTO } from './dto/job-send-invites.dto';
import * as moment from 'moment-timezone';
import { addDefaultStepsOnJobCreated } from '@shared/helpers/add-default-steps-on-job.helper';
import { PinoService } from '@modules/logger/pino.service';
import { validateProfileHasCompleted } from '../../shared/helpers/validate-profile-completed.helper';
import { ProfileNotCompleted } from '../../shared/exceptions/profile-not-completed.exception';
import { CONFIG } from '../../config';
import { JobStepFilterDTO } from './dto/job-step-filter.dto';
import { UpdateJobImageDTO } from './dto/job-update-image.dto';
import {
  differenceInMonths,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import { GetAllJobsQueryParamsDto } from './dto/get-all-jobs-query-params.dto';
import { PushStartService } from '@libs/push-start/push-start.service';
import { PsTestResult } from 'src/schemas/ps-test-result.schema';
@Injectable()
export class JobService {
  employerPopulate = {
    path: 'employer',
    model: 'Employer',
    select: [
      '_id',
      'cnpj',
      'corporateName',
      'businessName',
      'profileImage',
      'profile',
      '-user',
    ],
  };

  benefitsPopulate = {
    path: 'benefits',
    model: 'Benefit',
  };

  stepsPopulate = [
    {
      path: 'candidates',
      model: 'JobStepCandidate',
      populate: [
        {
          path: 'candidate',
          model: 'Employee',
          select: ['-certificates'],
          populate: [
            {
              path: 'user',
              model: 'User',
              select: ['email', '-role'],
            },
          ],
        },
        {
          path: 'reprovedStep',
          model: 'JobStep',
          select: ['_id', 'name'],
        },
      ],
    },
    {
      path: 'job',
      model: 'Job',
      select: ['_id', 'area', '-benefits'],
    },
  ];

  defaultPopulate = [
    this.employerPopulate,
    {
      path: 'steps',
      model: 'JobStep',
      populate: this.stepsPopulate,
    },
    {
      path: 'newCandidates',
      model: 'JobStepCandidate',
      populate: [
        {
          path: 'candidate',
          model: 'Employee',
          select: [
            '-user',
            '-academicBackgrounds',
            '-tools',
            '-languages',
            '-about',
            '-certificates',
          ],
        },
        {
          path: 'reprovedStep',
          model: 'JobStep',
          select: ['_id', 'name'],
        },
      ],
    },
    this.benefitsPopulate,
  ];

  private jobImagePath: string;

  constructor(
    @InjectModel(Job.name)
    private jobModel: AggregatePaginateModel<JobDocument>,
    @InjectModel(JobStep.name)
    private jobStepModel: PaginateModel<JobStepDocument>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService,
    private employerService: EmployerService,
    private mailService: MailService,
    private readonly s3Service: AwsS3Service,
    private configService: ConfigService,
    private readonly logger: PinoService,
    @InjectModel(Job.name)
    private jobPageModel: PaginateModel<JobDocument>,
    @Inject(forwardRef(() => PushStartService))
    private pushStartService: PushStartService,
    // @Inject(forwardRef(() => MacroJobService))
    // private macroJobService: MacroJobService,
    @InjectModel(MacroJob.name)
    private macroJobModel: Model<MacroJobDocument>,
  ) {
    this.jobImagePath = `${this.configService.get<string>(
      CONFIG.JOB_IMAGE_PATH,
    )}`;
  }

  findAll(
    params?: PaginateOptions<IJob> & {
      withCandidate?: string | boolean;
      candidateId?: string;
      closed?: string | boolean;
    },
    entityId?: string,
    role: string = DefaultRoles.employer,
  ) {
    const {
      q,
      filterQuery,
      withCandidate,
      candidateId,
      closed,
      ...paginateOptions
    } = params;
    const cdtId = candidateId ? candidateId : entityId;

    const options = {
      ...defaultPaginateOptions,
      ...paginateOptions,
    };

    let search: PipelineStage[] = [];

    if (withCandidate == 'true') {
      search.push(...search, {
        $match: {
          $or: [
            {
              'steps.candidates._id': {
                $eq: new ObjectId(cdtId),
              },
            },
            {
              'newCandidates._id': {
                $eq: new ObjectId(cdtId),
              },
            },
          ],
        },
      });
    }

    if (typeof withCandidate !== 'undefined' && withCandidate == 'false') {
      search.push(...search, {
        $match: {
          $and: [
            {
              'steps.candidates._id': {
                $nin: [new ObjectId(cdtId)],
              },
            },
            {
              'newCandidates._id': {
                $nin: [new ObjectId(cdtId)],
              },
            },
          ],
        },
      });
    }

    if (typeof closed !== 'undefined') {
      search.push(...search, {
        $match: {
          closed: {
            $eq: closed == 'true',
          },
        },
      });
    }

    if (typeof closed !== 'undefined' || closed === false) {
      search.push(...search, {
        $match: {
          finishAt: { $gte: new Date() },
        },
      });
    }

    if (q) {
      search.push({
        $match: {
          $or: [
            { area: { $regex: new RegExp(q, 'i') } },
            { internshipAddress: { $regex: new RegExp(q, 'i') } },
            { 'employer.cnpj': { $regex: new RegExp(q, 'i') } },
            { 'employer.corporateName': { $regex: new RegExp(q, 'i') } },
            { 'employer.businessName': { $regex: new RegExp(q, 'i') } },
          ],
        },
      });
    }

    if (filterQuery)
      search = parseIdStringToObjectId([{ $match: filterQuery }]);

    if (role === DefaultRoles.employer)
      search.push({
        $match: {
          'employer._id': { $eq: new ObjectId(entityId) },
        },
      });

    const jobsAggregate = this.jobModel.aggregate([
      {
        $lookup: {
          from: 'states',
          localField: 'state',
          foreignField: '_id',
          as: 'state',
        },
      },
      {
        $unwind: {
          path: '$state',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'jobsteps',
          localField: 'steps',
          foreignField: '_id',
          as: 'steps',
          pipeline: [
            {
              $lookup: {
                from: 'employees',
                localField: 'candidates.candidate',
                foreignField: '_id',
                as: 'candidateitems',
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                order: 1,
                lastStep: 1,
                candidates: {
                  $map: {
                    input: '$candidates',
                    in: {
                      candidate: {
                        $arrayElemAt: [
                          '$candidateitems',
                          {
                            $indexOfArray: [
                              '$candidateitems._id',
                              '$$this.candidate',
                            ],
                          },
                        ],
                      },
                      status: '$$this.status',
                      receivedCustomFeedback: '$$this.receivedCustomFeedback',
                      _id: '$$this._id',
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'employers',
          localField: 'employer',
          foreignField: '_id',
          as: 'employer',
          pipeline: [
            {
              $lookup: {
                from: 'segments',
                localField: 'profile.segment',
                foreignField: '_id',
                as: 'profile.segment',
              },
            },
            {
              $set: {
                'profile.segment': {
                  $arrayElemAt: ['$profile.segment', 0],
                },
              },
            },
          ],
        },
      },
      {
        $set: {
          employer: {
            $arrayElemAt: ['$employer', 0],
          },
        },
      },
      {
        $lookup: {
          from: 'benefits',
          localField: 'benefits',
          foreignField: '_id',
          as: 'benefits',
        },
      },
      {
        $addFields: {
          hasSteps: { $gt: [{ $size: '$steps' }, 0] },
        },
      },
      ...search,
      { $sort: { closed: 1 } },
    ]);

    return this.jobModel.aggregatePaginate(jobsAggregate, options);
  }

  async findAllJobsWithFliters(
    params?: GetAllJobsQueryParamsDto,
    entityId?: string,
    role?: string,
  ) {
    const jobDefaultPaginateOptions: PaginateOptions<IJob> = {
      page: params.page,
      limit: params.limit,
    };

    const filterQuery = this.buildQueryFilter(params, entityId, role);

    const options = {
      filterQuery,
      ...jobDefaultPaginateOptions,
    };

    return this.findAllJobsSimple(options);
  }

  buildQueryFilter(
    params?: GetAllJobsQueryParamsDto,
    entityId?: string,
    role?: string,
  ) {
    let query: any = {};

    if (!params) {
      return query;
    }

    if (role === DefaultRoles.employer) {
      query = {
        ...query,
        employer: { $eq: { _id: new ObjectId(entityId) } },
      };
    }

    if (
      typeof params?.withCandidate !== 'undefined' &&
      params.withCandidate === true
    ) {
      query = {
        ...query,
        $or: [
          {
            'steps.candidates': { $elemMatch: { _id: new ObjectId(entityId) } },
          },
          { 'participants.candidate': new ObjectId(entityId) },
        ],
      };
    }

    if (params?.status && params?.status !== 'ALL') {
      const currentDate = new Date();
      if (params?.status === 'CLOSED') {
        query = {
          ...query,
          finishAt: {
            $lte: currentDate,
          },
        };
      } else {
        query = {
          ...query,
          finishAt: {
            $gte: currentDate,
          },
        };
      }
    }

    if (params?.title?.length) {
      const titleRegex = new RegExp(params.title, 'i');
      const areaRegex = new RegExp(params.title, 'i');

      query = {
        ...query,
        $or: [
          { title: { $regex: titleRegex } },
          { area: { $regex: areaRegex } },
        ],
      };
    }

    if (params?.state?.length) {
      query = {
        ...query,
        state: {
          _id: params.state,
        },
      };
    }

    if (params?.city?.length) {
      query = {
        ...query,
        city: params?.city,
      };
    }

    if (params?.minInternshipValue) {
      query = {
        ...query,
        internshipValue: {
          $gte: params.minInternshipValue,
        },
      };
    }

    if (params?.maxInternshipValue) {
      query = {
        ...query,
        internshipValue: {
          ...query?.internshipValue,
          $lte: params.maxInternshipValue,
        },
      };
    }

    if (params?.benefits?.length) {
      query = {
        ...query,
        'benefits._id': {
          $in: params.benefits,
        },
      };
    }

    if (params?.jobModel?.length) {
      query = {
        ...query,
        jobModel: {
          $in: params.jobModel,
        },
      };
    }

    const birthDateMinDate = subYears(new Date(), params.AgeMin);

    const birthDateMaxDate = subYears(new Date(), params.AgeMax);

    if (params?.AgeMin && params?.AgeMax) {
      query = {
        ...query,
        'steps.candidates.birthDate': {
          $gte: birthDateMinDate,
          $lte: birthDateMaxDate,
        },
      };
    } else if (params?.AgeMin) {
      query = {
        ...query,
        'steps.candidates.birthDate': {
          $gte: birthDateMinDate,
        },
      };
    } else if (params?.AgeMax) {
      query = {
        ...query,
        'steps.candidates.birthDate': {
          $lte: birthDateMaxDate,
        },
      };
    }

    if (params?.employeer?.length) {
      query = {
        ...query,
        employer: { $eq: { _id: new ObjectId(params.employeer) } },
      };
    }

    if (params?.job?.length) {
      query = {
        ...query,
        _id: new ObjectId(params.job),
      };
    }

    // if(params?.macroJob){
    //     const macroJob =  await this.macroJobService
    //     .findOne(params.macroJob);

    //     if(macroJob){
    //       query ={
    //         ...query,
    //         _id : new ObjectId(macroJob.jobs[1].id)
    //       }
    //     }
    //   }
    return query;
  }

  findAllJobsSimple(params?: PaginateOptions<Job>) {
    const { q, filterQuery, ...paginateOptions } = params;

    const options = {
      populate: this.defaultPopulate,
      ...paginateOptions,
    };

    let search = {};

    if (q) {
      search = {
        $or: [
          { area: { $regex: new RegExp(q, 'i') } },
          { internshipAddress: { $regex: new RegExp(q, 'i') } },
          { 'employer.cnpj': { $regex: new RegExp(q, 'i') } },
          { 'employer.corporateName': { $regex: new RegExp(q, 'i') } },
          { 'employer.businessName': { $regex: new RegExp(q, 'i') } },
        ],
      };
    }

    if (filterQuery) search = filterQuery;

    return this.jobPageModel.paginate(search, options);
  }

  async findOne(id?: string, params: { q?: string } = {}) {
    const { q } = params;

    const job = (await this.jobModel
      .findOne({ _id: id })
      .populate(this.defaultPopulate)
      .exec()) as any;

    if (!job) throw new NotFoundException('Vaga não encontrada');

    const macroJob = await this.macroJobModel
      .findOne({
        jobs: {
          $in: [job._id],
        },
      })
      .exec();

    /* eslint no-underscore-dangle: 0 */
    job._doc.macro = macroJob;

    job.newCandidates = job.newCandidates
      ?.map((x) => {
        if (q) {
          const qRegex = new RegExp(q, 'i');
          const firstNameMatched = qRegex.test(x.candidate.firstName);
          const lastNameMatched = qRegex.test(x.candidate.lastName);
          const matchedQuery = firstNameMatched || lastNameMatched;
          if (q && matchedQuery) return x;
          return;
        }
        return x;
      })
      .filter((candidate) => typeof candidate !== 'undefined');

    return job;
  }

  async createJob(userId: string, job: IJobCreate) {
    const session = await this.connection.startSession();
    const employer = await this.employerService.findByUserId(userId);

    if (!employer) throw new NotFoundException('Empresa não encontrada');

    const lastjob = await this.jobModel
      .findOne({}, {}, { sort: { externalJobId: -1 } })
      .exec();

    job.externalJobId = lastjob ? lastjob.externalJobId + 1 : 0;

    job.employer = employer._id;

    job.jobImage = await this.s3Service.uploadMedia(
      job.jobImage,
      `${this.jobImagePath}${String(uuid())}.png`,
    );

    session.startTransaction();
    try {
      const createdJob = await new this.jobModel(job).save();

      this.logger.log('JOB - job created', {
        jobId: createdJob._id,
      });

      await this.employerService.addEmployerJobs(
        employer._id,
        [String(createdJob._id)],
        session,
      );

      addDefaultStepsOnJobCreated(this.jobStepModel, createdJob._id);

      this.logger.log('JOB STEP - steps created', {
        jobId: createdJob._id,
      });

      await session.commitTransaction();
      return createdJob;
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async closeJob(id: string) {
    return this.jobModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            closed: true,
            closedAt: new Date().getUTCDate().toString(),
          },
        },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)

      .exec();
  }

  async openJob(id: string) {
    return this.jobModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            closed: false,
          },
          $unset: {
            closedAt: null,
          },
        },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)

      .exec();
  }

  async updateJob(id: string, newData: IJobUpdate) {
    return this.jobModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        newData,
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async updateJobImage(id: string, newData: UpdateJobImageDTO) {
    try {
      const data: any = {};
      if (!newData.jobImage) {
        throw new BadRequestException({
          message: 'Você precisa inserir uma imagem válida.',
        });
      }

      data.jobImage = await this.s3Service.uploadMedia(
        newData.jobImage,
        `${this.jobImagePath}${String(uuid())}.png`,
      );

      return await this.jobModel
        .findOneAndUpdate(
          {
            _id: id,
          },
          data,
          {
            new: true,
          },
        )
        .populate(this.defaultPopulate)
        .exec();
    } catch (err: any) {
      this.logger.error(`JOB-SERVICE - error on update jobImage`, {
        error: err.message,
      });

      throw new BadRequestException({
        errorCode: ErrorCodes.GENERIC,
        message:
          'Erro ao executar o processo de atualização de imagem da vaga, tente novamente.',
      });
    }
  }

  async deleteJob(id: string) {
    const session = await this.connection.startSession();
    const job = await this.jobModel.findOne({ _id: id });
    session.startTransaction();
    try {
      await this.employerService.deleteEmployerJobs(
        job.employer._id,
        [id],
        session,
      );
      await this.jobStepModel
        .deleteMany({
          job: id,
        })
        .session(session)
        .exec();
      await this.jobModel
        .findOneAndRemove({
          _id: id,
        })
        .session(session)
        .populate(this.defaultPopulate)
        .exec();
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findOneStep(stepId?: string, params: JobStepFilterDTO = {}) {
    const {
      scholarshipPercentage,
      humanRace,
      name,
      pcd,
      email,
      isAvaliableForChange,
      sexualOrientation,
      course_id: courseId,
      learnWorldsUserCourseCompleted,
      tools,
      shift,
      languages,
      city,
      state,
      university_id: universityId,
      psMaxScore,
      psMinScore,
      period,
      status,
    } = params;

    const job = await this.jobStepModel
      .findOne({
        $and: [
          {
            _id: stepId,
          },
        ],
      })
      .populate(this.stepsPopulate)

      .exec();

    job.candidates = job.candidates.filter((candidateItem) => {
      const filterMatch: any = {};
      if (name) {
        filterMatch.name =
          `${candidateItem.candidate.firstName} ${candidateItem.candidate.lastName}`
            .toLowerCase()
            .includes(name.toLocaleLowerCase());
      }
      if (email) {
        filterMatch.email =
          candidateItem.candidate.user.email.includes(email) ||
          candidateItem.candidate.user.email === email;
      }
      if (city) {
        filterMatch.city = candidateItem.candidate.city === city;
      }

      if (state) {
        filterMatch.state =
          candidateItem.candidate.state._id.toString() === state;
      }

      if (universityId) {
        filterMatch.university =
          candidateItem.candidate.academicBackgrounds.find((y) => {
            return (
              y.university._id.toString() === universityId ||
              y.university.name === universityId
            );
          });
      }

      if (isAvaliableForChange) {
        filterMatch.isAvaliableForChange =
          candidateItem.candidate.isAvailableForChange === isAvaliableForChange;
      }

      if (psMinScore) {
        const averagePSScore =
          (candidateItem.psTestResults &&
            candidateItem.psTestResults.results
              .map((competence) => competence.score)
              .reduce((a, b) => a + b, 0) /
              candidateItem?.psTestResults?.results?.length) ||
          0;
        filterMatch.psMinScore = averagePSScore >= psMinScore;
      }

      if (psMaxScore) {
        const averagePSScore =
          (candidateItem.psTestResults &&
            candidateItem.psTestResults.results
              .map((competence) => competence.score)
              .reduce((a, b) => a + b, 0) /
              candidateItem?.psTestResults?.results?.length) ||
          0;
        filterMatch.psMaxScore = averagePSScore <= psMaxScore;
      }

      if (period) {
        filterMatch.period = period
          .map((periodItem) =>
            candidateItem.candidate.academicBackgrounds.find(
              (academicBackground) =>
                academicBackground.period === parseInt(periodItem),
            ),
          )
          .some((option) => option);
      }

      if (shift) {
        filterMatch.shift = shift
          .map((shiftItem) =>
            candidateItem.candidate.academicBackgrounds.find(
              (academicBackground) => {
                return academicBackground.shift === shiftItem;
              },
            ),
          )
          .some((option) => option);
      }

      if (languages) {
        filterMatch.languages = languages
          .map((language: any) =>
            candidateItem.candidate.languages.find(
              (candidateLanguage) =>
                candidateLanguage._id.toString() === language?.language &&
                language?.level === candidateLanguage.reading,
            ),
          )
          .every((language) => language);
      }

      if (tools) {
        filterMatch.tools = tools
          .map((tool: any) =>
            candidateItem.candidate.tools.find(
              (candidateTool) =>
                candidateTool._id.toString() === tool.tool &&
                candidateTool.level === tool.level,
            ),
          )
          .every((tool) => tool);
      }

      if (learnWorldsUserCourseCompleted) {
        filterMatch.learnWorldsUserCourseCompleted =
          (learnWorldsUserCourseCompleted === 'true') ===
          candidateItem.candidate.learnWorldsUserCourseCompleted;
      }

      if (courseId) {
        filterMatch.courses = courseId
          .map((course) =>
            candidateItem.candidate.academicBackgrounds.find(
              (candidateCourse) => {
                if (course.course === candidateCourse.course) {
                  if (course.period && course.period > 0) {
                    const courseStartedAt = candidateCourse.startDate;
                    const groupedCourseHalfYear =
                      courseStartedAt?.getMonth() + 1 <= 6
                        ? startOfYear(courseStartedAt)
                        : subMonths(
                            courseStartedAt,
                            courseStartedAt?.getMonth() + 1 - 6,
                          );

                    const currentHalfYear =
                      new Date().getMonth() + 1 <= 6
                        ? startOfMonth(startOfYear(new Date()))
                        : startOfMonth(
                            subMonths(
                              new Date(),
                              new Date().getMonth() + 1 - 6,
                            ),
                          );
                    const monthDiff = differenceInMonths(
                      currentHalfYear,
                      groupedCourseHalfYear,
                    );
                    return (
                      monthDiff >= course.period * 6 - 6 ||
                      candidateCourse?.period >= course.period
                    );
                  }
                }

                return candidateCourse.course === course.course;
              },
            ),
          )
          .some((candidateCourse) => candidateCourse);
      }

      if (sexualOrientation) {
        filterMatch.sexualOrientationOption = sexualOrientation
          .map(
            (sexualOrientationItem) =>
              candidateItem.candidate.about.sexualOrientation ===
              sexualOrientationItem,
          )
          .some((option) => option);
      }

      if (pcd) {
        filterMatch.pcd = pcd
          .map((option) => candidateItem.candidate.about.pcd === option)
          .some((option) => option);
      }

      if (humanRace) {
        filterMatch.humanRace = humanRace
          .map((option) => candidateItem.candidate.about.humanRace === option)
          .some((option) => option);
      }

      if (scholarshipPercentage) {
        filterMatch.scholarshipPercentage =
          !!candidateItem.candidate.academicBackgrounds.find(
            (school) =>
              school.scholarshipPercentage === parseInt(scholarshipPercentage),
          );
      }

      if (status) {
        filterMatch.status = candidateItem.status === status;
      } else {
        filterMatch.status =
          candidateItem.status === JobStepCandidateStatus.INITIAL;
      }

      if (Object.keys(filterMatch).length < 1) {
        return true;
      }

      return Object.keys(filterMatch).every((x) => !!filterMatch[x]);
    });

    return job;
  }

  async addStep(jobId: string, step: IJobStepCreate) {
    const session = await this.connection.startSession();
    const job = await this.jobModel
      .findOne({ _id: jobId })
      .populate(this.defaultPopulate)
      .exec();
    const defaultOrder = 1;

    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    if (!step.order) {
      if (!job.steps || job.steps.length === 0) step.order = defaultOrder;
      if (job.steps.length > 0) step.order = job.steps.length + 1;
    }

    step.lastStep = typeof step.lastStep !== 'undefined' ? step.lastStep : true;
    step.job = jobId;

    session.startTransaction();
    try {
      if (job.steps.length > 0) {
        await this.jobStepModel
          .updateMany(
            {
              _id: { $in: job.steps.map((jobStep) => jobStep._id) },
              order: step.order - 1,
            },
            {
              $set: {
                lastStep: false,
              },
            },
          )
          .session(session);
      }

      const createdStep = await new this.jobStepModel(step).save({ session });
      const updatedJob = await this.jobModel
        .findOneAndUpdate(
          {
            _id: jobId,
          },
          {
            $push: { steps: createdStep._id },
          },
          {
            new: true,
          },
        )
        .populate(this.defaultPopulate)
        .session(session)
        .exec();
      await session.commitTransaction();
      return updatedJob;
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async updateStep(
    jobId: string,
    stepId: string,
    step: IJobStepUpdate,
    $unset?: any,
  ) {
    const update: { $set: any; $unset?: any } = { $set: step };
    if ($unset) update.$unset = $unset;
    step.job = jobId;
    await this.jobStepModel
      .updateOne(
        {
          _id: stepId,
        },
        update,
        {
          new: true,
        },
      )
      .exec();
    return this.findOne(jobId);
  }

  async closeStep(jobId: string, stepId: string) {
    return this.updateStep(jobId, stepId, {
      closed: true,
      closedAt: new Date().getUTCDate().toString(),
    });
  }

  async openStep(jobId: string, stepId: string) {
    return this.updateStep(
      jobId,
      stepId,
      { closed: false },
      { closedAt: null },
    );
  }

  async removeStep(jobId: string, stepId: string) {
    const session = await this.connection.startSession();

    const job = await this.jobModel
      .findById(jobId)
      .populate(this.defaultPopulate);
    if (!job) throw new NotFoundException('A vaga não existe');

    const step = await this.jobStepModel.findById(stepId);
    if (!step) throw new NotFoundException('A etapa não existe');

    await session.withTransaction(async () => {
      await this.jobStepModel
        .findOneAndRemove({
          _id: stepId,
        })
        .session(session)
        .exec();
      const updatedJob = await this.jobModel
        .findOneAndUpdate(
          {
            _id: jobId,
          },
          {
            $pull: { steps: stepId },
          },
          {
            new: true,
          },
        )
        .populate(this.defaultPopulate)
        .session(session)
        .exec();

      const steps = updatedJob.steps.sort((a, b) => (a.order = b.order));
      const operations = steps.map((stp, index) =>
        this.jobStepModel
          .updateOne(
            { _id: stp._id },
            {
              $set: {
                order: index + 1,
                lastStep: index === steps.length - 1,
              },
            },
          )
          .session(session),
      );
      await Promise.all(operations);
    });
    return this.findOne(jobId);
  }

  async findCandidatesByStep(stepId?: string) {
    const job = await this.jobStepModel
      .findOne({ _id: stepId })
      .populate(this.stepsPopulate)
      .exec();

    return job;
  }

  async addCandidate(
    jobId: string,
    stepId: string,
    candidateId: string,
    previousSession?: ClientSession,
    linkPush?: string,
    psTestResults?: PsTestResult,
  ) {
    const session = previousSession || (await this.connection.startSession());
    const candidate = await this.employeeService.findById(candidateId);
    if (!candidate) throw new NotFoundException('Candidato não encontrado');

    const job = await this.jobModel.findOne({
      _id: jobId,
    });

    if (!job.steps && job.steps.length === 0)
      throw new BadRequestException('Sem etapas cadastradas.');

    if (!previousSession) session.startTransaction();

    try {
      const step = await this.jobStepModel
        .findById(stepId)
        .session(session)
        .populate(this.stepsPopulate)
        .exec();
      if (!step) throw new NotFoundException('Etapa não encontrada');

      if (
        step.candidates.length > 0 &&
        step.candidates?.some((cdt) => String(cdt._id) === candidateId)
      )
        throw new BadRequestException('Candidato já adicionado nessa etapa.');

      const jobCandidate: IJobStepCandidateUpdate = {
        _id: candidateId,
        candidate: candidateId,
        status: JobStepCandidateStatus.INITIAL,
        psTestUrl: linkPush,
        psTestResults: psTestResults,
      };

      await step
        .updateOne({ $push: { candidates: jobCandidate } })
        .session(session)
        .exec();
      if (!previousSession) await session.commitTransaction();
      return await this.findOne(jobId);
    } catch (error) {
      if (!previousSession) await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      if (!previousSession) await session.endSession();
    }
  }

  async removeCandidate(
    jobId: string,
    stepId: string,
    candidateId: string,
    previousSession?: ClientSession,
  ) {
    const session = previousSession || (await this.connection.startSession());
    const candidate = await this.employeeService.findById(candidateId);
    if (!candidate) throw new NotFoundException('Candidato não encontrado');

    const job = await this.jobModel.findOne({
      _id: jobId,
    });

    if (!job.steps && job.steps.length === 0)
      throw new BadRequestException('Sem etapas cadastradas.');

    if (!previousSession) session.startTransaction();
    try {
      const step = await this.jobStepModel
        .findById(stepId)
        .session(session)
        .exec();
      if (!step) throw new NotFoundException('Etapa não encontrada');

      await step
        .updateOne({ $pull: { candidates: { _id: candidateId } } })
        .session(session)
        .exec();

      if (!previousSession) await session.commitTransaction();
      return await this.findOneStep(stepId);
    } catch (error) {
      if (!previousSession) await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      if (!previousSession) await session.endSession();
    }
  }

  async approveCandidates(
    jobId: string,
    stepId: string,
    data?: ApproveReproveCandidatesDTO,
  ) {
    const candidates = data.candidates;
    const customFeedback = {
      customFeedback: data.customFeedback,
      customFeedbackFrom: data.customFeedbackFrom,
      customFeedbackTitle: data.customFeedbackTitle,
    };
    let response = {};
    for (const candidate of candidates) {
      try {
        response = await this.approveCandidate(
          jobId,
          stepId,
          candidate,
          customFeedback,
        );
      } catch (error) {
        this.logger.error(`JOB-SERVICE - error on approve candidates`, {
          error: error.message,
        });

        throw new BadRequestException({
          errorCode: ErrorCodes.GENERIC,
          message:
            'Erro ao executar o processo de aprovação de candidatos, tente novamente.',
        });
      }
    }
    return response;
  }

  async approveCandidate(
    jobId: string,
    stepId: string,
    candidateId: string,
    data?: ApproveReproveCandidateDTO,
  ) {
    const session = await this.connection.startSession();
    const step = await this.jobStepModel.findById(stepId).exec();

    if (!step) throw new BadRequestException('Etapa não encontrada.');

    const candidate = await this.employeeService.findById(candidateId);
    if (!candidate) throw new BadRequestException('Candidato não encontrado.');

    const job = await this.jobModel.findById(step.job);

    const psTemplate = await this.pushStartService.findByUserId(
      candidate.externalId,
    );

    session.startTransaction();

    try {
      if (!step.lastStep) {
        const nextStep = await this.jobStepModel
          .findOne({
            job: jobId,
            order: step.order + 1,
            defaultStep: false,
          })
          .session(session);

        if (
          !nextStep.candidates.some((cdt) => String(cdt._id) === candidateId)
        ) {
          await this.addCandidate(
            jobId,
            String(nextStep._id),
            candidateId,
            session,
            psTemplate?.psTestUrl || null,
            psTemplate,
          );
        }
      }

      if (data?.customFeedback) {
        await this.jobStepModel
          .updateMany(
            {
              jobId,
            },
            {
              $set: {
                'candidates.$[c].customFeedback': data.customFeedback,
                'candidates.$[c].customFeedbackFrom': data.customFeedbackFrom,
                'candidates.$[c].customFeedbackTitle': data.customFeedbackTitle,
                'candidates.$[c].receivedCustomFeedback': true,
              },
            },
            {
              new: true,
              arrayFilters: [
                {
                  'c._id': new ObjectId(candidateId),
                },
              ],
            },
          )
          .session(session)
          .exec();
      } else {
        await this.jobStepModel
          .updateMany(
            {
              jobId,
            },
            {
              $set: {
                'candidates.$[c].customFeedback': null,
                'candidates.$[c].customFeedbackFrom': null,
                'candidates.$[c].customFeedbackTitle': null,
                'candidates.$[c].receivedCustomFeedback': false,
              },
            },
            {
              new: true,
              arrayFilters: [
                {
                  'c._id': new ObjectId(candidateId),
                },
              ],
            },
          )
          .session(session)
          .exec();
      }

      await this.jobStepModel
        .updateMany(
          {
            jobId,
            order: { $lte: step.order },
          },
          {
            $set: {
              'candidates.$[c].status': JobStepCandidateStatus.APPROVED,
            },
            $unset: {
              'candidates.$[c].reprovedStep': null,
            },
          },
          {
            new: true,
            arrayFilters: [
              {
                'c._id': new ObjectId(candidateId),
              },
            ],
          },
        )
        .session(session)
        .exec();
      await session.commitTransaction();

      this.mailService.sendCandidateApproveMessage({
        email: candidate.user.email,
        firstName: candidate.firstName,
        jobTitle: job.title,
      });

      return await this.findOneStep(stepId);
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async reproveCandidates(
    jobId: string,
    stepId: string,
    data?: ApproveReproveCandidatesDTO,
  ) {
    const candidates = data.candidates;
    const customFeedback = {
      customFeedback: data.customFeedback,
      customFeedbackFrom: data.customFeedbackFrom,
      customFeedbackTitle: data.customFeedbackTitle,
    };
    let response = {};
    for (const candidate of candidates) {
      try {
        response = await this.reproveCandidate(
          jobId,
          stepId,
          candidate,
          customFeedback,
        );
      } catch (error) {
        this.logger.error(`JOB-SERVICE - error on reprove candidates`, {
          error: error.message,
        });

        throw new BadRequestException({
          errorCode: ErrorCodes.GENERIC,
          message:
            'Erro ao executar o processo de reprovação de candidatos, tente novamente.',
        });
      }
    }
    return response;
  }

  async reproveCandidate(
    jobId: string,
    stepId: string,
    candidateId: string,
    data?: ApproveReproveCandidateDTO,
  ) {
    const session = await this.connection.startSession();

    const step = await this.jobStepModel.findById(stepId).exec();

    if (!step) throw new BadRequestException('Etapa não encontrada.');

    const candidate = await this.employeeService.findById(candidateId);

    if (!candidate) throw new BadRequestException('Candidato não encontrado.');

    const job = await this.jobModel.findById(step.job);

    session.startTransaction();
    try {
      if (!step.lastStep) {
        await this.jobStepModel
          .updateMany(
            {
              jobId,
              order: { $gt: step.order },
            },
            {
              $pull: { candidates: { _id: candidateId } },
            },
          )
          .session(session)
          .exec();
      }

      if (data?.customFeedback) {
        await this.jobStepModel
          .updateMany(
            {
              jobId,
            },
            {
              $set: {
                'candidates.$[c].customFeedback': data.customFeedback,
                'candidates.$[c].customFeedbackFrom': data.customFeedbackFrom,
                'candidates.$[c].customFeedbackTitle': data.customFeedbackTitle,
                'candidates.$[c].receivedCustomFeedback': true,
              },
            },
            {
              new: true,
              arrayFilters: [
                {
                  'c._id': new ObjectId(candidateId),
                },
              ],
            },
          )
          .session(session)
          .exec();
      } else {
        await this.jobStepModel
          .updateMany(
            {
              jobId,
            },
            {
              $set: {
                'candidates.$[c].customFeedback': null,
                'candidates.$[c].customFeedbackFrom': null,
                'candidates.$[c].customFeedbackTitle': null,
                'candidates.$[c].receivedCustomFeedback': false,
              },
            },
            {
              new: true,
              arrayFilters: [
                {
                  'c._id': new ObjectId(candidateId),
                },
              ],
            },
          )
          .session(session)
          .exec();
      }

      await step
        .updateOne(
          {
            $set: {
              'candidates.$[c].status': JobStepCandidateStatus.REPROVED,
              'candidates.$[c].reprovedStep': stepId,
            },
          },
          {
            new: true,
            arrayFilters: [
              {
                'c._id': new ObjectId(candidateId),
              },
            ],
          },
        )
        .session(session)
        .exec();

      await session.commitTransaction();

      this.mailService.sendCandidateReprovedMessage({
        email: candidate.user.email,
        firstName: candidate.firstName,
        jobTitle: job.title,
      });

      return await this.findOneStep(stepId);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async applyToJob(jobId: string, candidateId: string, data: JobApplyDTO) {
    const session = await this.connection.startSession();

    const candidate = await this.employeeService.findById(candidateId);

    if (!candidate) {
      throw new NotFoundException('Candidato não encontrado.');
    }

    const { hasCompletedProfile } = await validateProfileHasCompleted(
      candidate,
    );

    if (!hasCompletedProfile) {
      throw new ProfileNotCompleted();
    }
    const job = await this.findOne(jobId);

    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }

    if (job.closed || moment.tz('America/Sao_Paulo').isAfter(job.finishAt)) {
      throw new NotFoundException('Vaga esta encerrada.');
    }

    const isHasApplyOnJob =
      job.newCandidates?.some((cdt) => cdt._id.toString() === candidateId) ||
      job.steps?.some((stp) =>
        stp.candidates?.find((cdt) => cdt._id.toString() === candidateId),
      );
    if (isHasApplyOnJob) {
      throw new BadRequestException('Candidato já se aplicou nessa vaga.');
    }

    session.startTransaction();

    try {
      const jobCandidate: IJobStepCandidateUpdate = {
        _id: candidateId,
        candidate: candidateId,
        howDidGetThisJob: data.howDidGetThisJob,
        status: JobStepCandidateStatus.INITIAL,
      };

      const participant = {
        candidate: candidateId,
        howDidGetThisJob: data.howDidGetThisJob,
      };

      await job
        .updateOne({
          $push: {
            newCandidates: jobCandidate,
            participants: participant,
          },
        })
        .session(session)
        .exec();

      this.sendCandidateToSteps(jobId, candidateId);

      await session.commitTransaction();

      return await this.findOne(jobId);
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async reproveCandidateFromJob(jobId: string, candidateId: string) {
    const session = await this.connection.startSession();

    const candidate = await this.employeeService.findById(candidateId);
    if (!candidate) throw new NotFoundException('Candidato não encontrado.');

    const job = await this.findOne(jobId);
    if (!job) throw new NotFoundException('Vaga não encontrada.');

    session.startTransaction();
    try {
      await job
        .updateOne(
          {
            $set: {
              'newCandidates.$[c].status': JobStepCandidateStatus.REPROVED,
            },
          },
          {
            new: true,
            arrayFilters: [
              {
                'c._id': new ObjectId(candidateId),
              },
            ],
          },
        )
        .session(session)
        .exec();

      await session.commitTransaction();

      return await this.findOne(jobId);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async removeCandidateFromJob(jobId: string, candidateId: string) {
    const session = await this.connection.startSession();

    const candidate = await this.employeeService.findById(candidateId);
    if (!candidate) throw new NotFoundException('Candidato não encontrado.');

    const job = await this.findOne(jobId);
    if (!job) throw new NotFoundException('Vaga não encontrada.');

    if (
      !job.newCandidates?.some((cdt) => String(cdt._id) === candidateId) &&
      !job.steps?.some((stp) =>
        stp.candidates?.some((cdt) => String(cdt._id) === candidateId),
      )
    )
      throw new BadRequestException('Candidato não se aplicou nessa vaga.');

    session.startTransaction();
    try {
      await job
        .updateOne({
          $pull: {
            newCandidates: { _id: candidate._id },
            participants: { candidate: candidate._id },
          },
        })
        .session(session)
        .exec();

      await this.jobStepModel
        .updateMany(
          {
            job: jobId,
          },
          { $pull: { candidates: { _id: candidate._id } } },
        )
        .session(session);

      await session.commitTransaction();

      return await this.findOne(jobId);
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async sendCandidateToSteps(jobId: string, candidateId: string) {
    const session = await this.connection.startSession();

    session.startTransaction();

    const candidate = await this.employeeService.findById(candidateId);

    if (!candidate) throw new NotFoundException('Candidato não encontrado.');

    const job = await this.findOne(jobId);

    if (!job) throw new NotFoundException('Vaga não encontrada.');

    if (
      job.steps?.some((stp) =>
        stp.candidates?.some((cdt) => String(cdt._id) === candidateId),
      )
    ) {
      throw new BadRequestException('Candidato já está no processo seletivo.');
    }

    try {
      await job
        .updateOne({
          $pull: { newCandidates: { _id: candidate._id } },
        })
        .session(session)
        .exec();

      let testePSUrl;
      const existingTestResults = await this.pushStartService.findByUserId(
        candidate.externalId,
      );

      if (job.psTestId) {
        if (!existingTestResults) {
          testePSUrl = (
            await this.pushStartService.createTest(
              candidateId,
              job.psTestId,
              job._id,
            )
          ).redirectUrl;
        } else {
          testePSUrl = existingTestResults.psTestUrl;
        }
      }
      await this.addCandidate(
        jobId,
        job.steps?.find((stp) => stp.order === 1)._id,
        candidateId,
        session,
        testePSUrl,
        existingTestResults ?? existingTestResults,
      );

      await session.commitTransaction();

      return await this.findOne(jobId);
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async toggleFavoriteJob(jobId: string, employeeId: string) {
    const session = await this.connection.startSession();
    const job = await this.jobModel
      .findOne({ _id: jobId })
      .populate(this.defaultPopulate)
      .exec();

    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    await session.withTransaction(async () => {
      if (job.favoriteCandidates?.some((cdt) => String(cdt) === employeeId)) {
        await job
          .updateOne(
            {
              $pull: { favoriteCandidates: employeeId },
            },
            {
              new: true,
            },
          )
          .populate(this.defaultPopulate)
          .exec();
      } else {
        await job
          .updateOne(
            {
              $push: { favoriteCandidates: employeeId },
            },
            {
              new: true,
            },
          )
          .populate(this.defaultPopulate)
          .exec();
      }

      await this.employeeService.toggleJobFavorite(jobId, employeeId);
    });

    return this.findOne(jobId);
  }

  async sendJobInvite(jobId: string, candidateId: string) {
    const job = await this.jobModel
      .findOne({ _id: jobId })
      .populate(this.defaultPopulate)
      .exec();

    if (!job)
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);

    const candidate = await this.employeeService.findById(candidateId);

    if (!candidate) throw new NotFoundException(`Esse candidato não existe.`);

    this.mailService.sendJobInvite({
      email: candidate.user.email,
      candidateName: candidate.firstName,
      jobTitle: job.area,
      jobId: String(job._id),
    });
  }

  async sendJobInvites(payload: JobSendInvitesDTO) {
    const { jobId, candidatesId } = payload;

    const job = await this.jobModel
      .findOne({ _id: jobId })
      .populate(this.defaultPopulate)
      .exec();

    if (!job) {
      throw new NotFoundException(`A vaga com id: ${jobId} não existe.`);
    }

    candidatesId.forEach(async (candidateId: string) => {
      const candidate = await this.employeeService.findById(candidateId);

      if (!candidate) {
        return;
      }

      await this.mailService.sendJobInvite({
        email: candidate.user.email,
        candidateName: candidate.firstName,
        jobTitle: job.area,
        jobId: String(job._id),
      });
    });
  }

  async getSuggestionJobs(
    jobId: string,
    params: { limit?: number; q?: string } = {},
  ) {
    const { limit = 5 } = params;

    const jobsAggregate = this.jobModel
      .aggregate([
        {
          $match: {
            _id: { $ne: new Types.ObjectId(jobId) },
            closed: false,
            finishAt: { $gte: new Date() },
          },
        },
        {
          $lookup: {
            from: 'states',
            localField: 'state',
            foreignField: '_id',
            as: 'state',
          },
        },
        {
          $unwind: {
            path: '$state',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'employers',
            localField: 'employer',
            foreignField: '_id',
            as: 'employer',
            pipeline: [
              {
                $lookup: {
                  from: 'segments',
                  localField: 'profile.segment',
                  foreignField: '_id',
                  as: 'profile.segment',
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$employer',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'benefits',
            localField: 'benefits',
            foreignField: '_id',
            as: 'benefits',
          },
        },
        {
          $project: {
            _id: 1,
            jobModel: 1,
            jobDescription: 1,
            title: 1,
            internshipValue: 1,
            quantity: 1,
            finishAt: 1,
            jobImage: 1,
            city: 1,
            state: 1,
            'employer._id': 1,
            'employer.corporateName': 1,
            'employer.businessName': 1,
            'employer.profileImage': 1,
          },
        },
      ])
      .limit(Number(limit));

    return jobsAggregate;
  }

  async getJobStatisticsForAllJobs() {
    const jobs = await this.findAllJobsSimple({ limit: 5000 }); // Adjust limit as needed
    const statistics = {
      InscritosGeralProgramaEstagio: 0,
      InscritosPorAreaVaga: {}, // Statistics by area/vacancy
      Etnia: {}, // Statistics by ethnicity
      Genero: {}, // Statistics by gender
      Pcd: {}, // Statistics by disability
      Etapas: {
        Inscrito: 0,
        AssessmentGamificado: 0,
        Triagem: 0,
        EntrevistaAU: 0,
        PainelOnline: 0,
        EntrevistaPessoaGestora: 0,
        ResultadoFinal: 0,
      },
    };

    for (const job of jobs.docs) {
      for (const step of job.steps) {
        for (const participant of step.candidates) {
          if (participant.status === JobStepCandidateStatus.INITIAL) {
            // Count total program internship applicants
            statistics.InscritosGeralProgramaEstagio++;

            // Count applicants by area/vacancy
            const area = job.area || 'Sem Área Específica'; // Use a default if no area specified
            if (!statistics.InscritosPorAreaVaga[area]) {
              statistics.InscritosPorAreaVaga[area] = 0;
            }
            statistics.InscritosPorAreaVaga[area]++;

            // Count applicants by ethnicity
            const ethnicity =
              participant.candidate.about.humanRace || 'Não Informada'; // Use a default if not specified
            if (!statistics.Etnia[ethnicity]) {
              statistics.Etnia[ethnicity] = 0;
            }
            statistics.Etnia[ethnicity]++;

            // Count applicants by gender
            const gender = participant.candidate.gender || 'Não Informado'; // Use a default if not specified
            if (!statistics.Genero[gender]) {
              statistics.Genero[gender] = 0;
            }
            statistics.Genero[gender]++;

            // Count applicants by disability
            const disability =
              participant.candidate.about.pcd || 'Não Informada'; // Use a default if not specified
            if (!statistics.Pcd[disability]) {
              statistics.Pcd[disability] = 0;
            }
            statistics.Pcd[disability]++;
          }

          // Count applicants by stage
          switch (step.name) {
            case 'Inscrito':
              statistics.Etapas.Inscrito++;
              break;
            case 'AssessmentGamificado':
              statistics.Etapas.AssessmentGamificado++;
              break;
            case 'Triagem':
              statistics.Etapas.Triagem++;
              break;
            case 'EntrevistaAU':
              statistics.Etapas.EntrevistaAU++;
              break;
            case 'PainelOnline':
              statistics.Etapas.PainelOnline++;
              break;
            case 'EntrevistaPessoaGestora':
              statistics.Etapas.EntrevistaPessoaGestora++;
              break;
            case 'ResultadoFinal':
              statistics.Etapas.ResultadoFinal++;
              break;
            default:
              break;
          }
        }
      }
    }

    return statistics;
  }
}