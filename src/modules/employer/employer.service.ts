import { CONFIG } from '@config/index';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Employer, EmployerDocument } from '@schemas';
import { DefaultRoles, ErrorCodes } from '@shared/enums';
import {
  generateExpirationDate,
  generateRandomNumber,
  parseToNumberString,
} from '@shared/helpers';
import {
  defaultPaginateOptions,
  IAddressUpdate,
  IEmployer,
  IEmployerDashboard,
  IEmployerPayload,
  IEmployerUpdate,
  PaginateOptions,
} from '@shared/interfaces';
import { ObjectId, UUID } from 'bson';
import { isEmpty } from 'class-validator';
import { format, formatISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClientSession, Connection, PaginateModel } from 'mongoose';
import { RoleService } from '../authorization/role/role.service';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { EmployeeService } from '../employee/employee.service';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { LocalEmployerSignupDTO } from './dto/employer-signup.dto';
import slugify from 'slugify';

@Injectable()
export class EmployerService {
  defaultPopulate = [
    {
      path: 'favoriteCandidates',
      model: 'Employee',
      select: ['-user'],
    },
  ];

  jobsPopulate = [
    {
      path: 'jobs',
      model: 'Job',
      select: [
        '-steps',
        '-favoriteCandidates',
        '-newCandidates',
        '-participants',
      ],
    },
  ];

  private profileImagePath: string;

  constructor(
    @InjectModel(Employer.name)
    private employerModel: PaginateModel<EmployerDocument>,
    @InjectConnection() private readonly connection: Connection,
    private userService: UserService,
    private mailService: MailService,
    private configService: ConfigService,
    private roleService: RoleService,
    private readonly s3Service: AwsS3Service,
    private readonly employeeService: EmployeeService,
  ) {
    this.profileImagePath = `images/avatar/profile-img-${new UUID().toString()}`;
  }

  async signup({ email, password, cnpj, ...data }: LocalEmployerSignupDTO) {
    const formatedCnpj = parseToNumberString(cnpj);
    const createdEmployer = await this.employerModel
      .findOne({ cnpj: formatedCnpj })
      .lean();
    if (createdEmployer)
      throw new BadRequestException({
        errorCode: ErrorCodes.EMPLOYER_ALREADY_REGISTERED,
        message: 'Empresa já está cadastrada!',
      });

    const emailConfirmationCode = generateRandomNumber();
    const emailConfirmationExpiration = generateExpirationDate(
      this.configService.get<number>(CONFIG.RESET_PASSWORD_TOKEN_EXPIRATION),
    );

    const role = await this.roleService.findRoleByName(DefaultRoles.employer);

    const user = await this.userService.createUser({
      email,
      password,
      emailConfirmationCode,
      emailConfirmationExpiration,
      role: role._id,
    });
    const employer = new this.employerModel({
      cnpj: formatedCnpj,
      ...data,
      user: user._id,
    });
    await employer.save();

    await this.mailService.sendEmailConfirmation(
      user.email,
      employer.corporateName,
      user._id,
      emailConfirmationCode,
    );
  }

  async findByUserId(
    userId: string,
    withPassword = false,
  ): Promise<IEmployerPayload> {
    const employer = await this.employerModel
      .findOne({
        user: userId,
      })
      .populate(this.defaultPopulate)
      .lean({ autopopulate: true });

    if (!withPassword) delete employer.user.password;
    return employer;
  }

  async findById(id: string, withPassword = false): Promise<IEmployerPayload> {
    const employer = await this.employerModel
      .findById(id)
      .populate(this.defaultPopulate)
      .lean({ autopopulate: true });

    if (!withPassword) delete employer.user.password;
    return employer;
  }

  async findAllEmployers(params?: PaginateOptions<IEmployer>) {
    const { q, filterQuery, ...paginateOptions } = params;
    const employerDefaultPaginateOptions: PaginateOptions<IEmployer> = {
      select: ['_id', 'cnpj', 'corporateName', 'businessName', 'active'],
      populate: [
        {
          path: 'user',
          model: 'User',
          select: 'email',
          populate: {
            path: 'role',
          },
        },
        ...this.defaultPopulate,
      ],
      lean: true,
    };

    const options = {
      ...defaultPaginateOptions,
      ...employerDefaultPaginateOptions,
      ...paginateOptions,
    };

    let search = {};
    if (q) {
      search = {
        $or: [
          { corporateName: { $regex: new RegExp(q, 'i') } },
          { businessName: { $regex: new RegExp(q, 'i') } },
          { cnpj: { $regex: new RegExp(q, 'i') } },
        ],
      };
    }

    if (filterQuery) search = filterQuery;

    const data = await this.employerModel.paginate(search, options);
    const docs = data.docs.filter(
      (employer) => employer.user.role.name === DefaultRoles.employer,
    );
    return { ...data, docs };
  }

  async updateEmployerById(_id: string, newData: IEmployerUpdate) {
    if (newData.cnpj) newData.cnpj = parseToNumberString(newData.cnpj);
    if (newData.profile) {
      newData.profile.segment = isEmpty(newData.profile?.segment || '')
        ? undefined
        : newData.profile.segment;
    }
    return this.employerModel
      .findOneAndUpdate({ _id }, newData, {
        new: true,
      })
      .lean({ autopopulate: true })
      .exec();
  }

  async updateEmployerByUserId(userId: string, newData: IEmployerUpdate) {
    if (newData.cnpj) newData.cnpj = parseToNumberString(newData.cnpj);

    if (newData.profile) {
      newData.profile.segment = isEmpty(newData.profile?.segment || '')
        ? undefined
        : newData.profile.segment;
    }

    if (newData.businessName) {
      const slug = slugify(newData.businessName, {
        lower: true,
      });
      newData.slug = slug;
    }

    return this.employerModel
      .findOneAndUpdate({ user: userId }, newData, {
        new: true,
      })
      .lean({ autopopulate: true })
      .exec();
  }

  async updateProfileImage(userId: string, image: Express.Multer.File) {
    const user = await this.findByUserId(userId);

    if (user?.profileImage?.key) {
      await this.s3Service.removeMedia(user.profileImage.key);
    }

    const { key, location } = await this.s3Service.uploadMedia(
      image,
      this.profileImagePath,
    );

    const userUpdated = await this.employerModel
      .findOneAndUpdate(
        { user: userId },
        { profileImage: { key, location } },
        { new: true },
      )
      .lean({ autopopulate: true })
      .exec();

    delete userUpdated.user.password;

    return userUpdated;
  }

  async updateEmployerSegment(userId: string, segmentId: string) {
    return this.employerModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $set: { 'profile.segment': segmentId } },
        {
          new: true,
        },
      )
      .lean({ autopopulate: true })
      .exec();
  }

  async deleteEmployerSegment(userId: string) {
    return this.employerModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $unset: { 'profile.segment': null } },
        {
          new: true,
        },
      )
      .lean({ autopopulate: true })
      .exec();
  }

  async updateEmployerBenefit(userId: string, benefitIds: string[]) {
    return this.employerModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $set: { 'profile.benefits': benefitIds } },
        {
          new: true,
        },
      )
      .lean({ autopopulate: true })
      .exec();
  }

  async deleteEmployerBenefit(userId: string, benefitId: string) {
    return this.employerModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $pull: { 'profile.benefits.$._id': benefitId } },
        {
          new: true,
        },
      )
      .lean({ autopopulate: true })
      .exec();
  }

  async updateEmployerAddress(userId: string, address: IAddressUpdate) {
    address.zipCode = parseToNumberString(address.zipCode);
    address.phoneNumber = parseToNumberString(address.phoneNumber);
    address.cellphoneNumber = parseToNumberString(address.cellphoneNumber);
    return this.employerModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $set: { addresses: [address] } },
        {
          new: true,
        },
      )
      .lean({ autopopulate: true })
      .exec();
  }

  async addEmployerJobs(
    employerId: string,
    jobIds: string[],
    previousSession?: ClientSession,
  ) {
    return this.employerModel
      .findOneAndUpdate(
        {
          _id: employerId,
        },
        { $push: { jobs: { $each: jobIds } } },
        {
          new: true,
        },
      )
      .lean({ autopopulate: true })
      .session(previousSession)
      .exec();
  }

  async updateEmployerJobs(
    employerId: string,
    jobIds: string[],
    previousSession?: ClientSession,
  ) {
    return this.employerModel
      .findOneAndUpdate(
        {
          _id: employerId,
        },
        { $set: { jobs: jobIds } },
        {
          new: true,
        },
      )
      .lean({ autopopulate: true })
      .session(previousSession)
      .exec();
  }

  async deleteEmployerJobs(
    employerId: string,
    jobId: string[],
    session?: ClientSession,
  ): Promise<any> {
    return this.employerModel
      .findOneAndUpdate(
        {
          _id: employerId,
        },
        { $pullAll: { jobs: jobId } },
        {
          new: true,
        },
      )
      .session(session)
      .exec();
  }

  async toggleFavoriteEmployee(candidateId: string, employerId: string) {
    const session = await this.connection.startSession();
    const employer = await this.employerModel
      .findOne({ _id: employerId })
      .populate(this.defaultPopulate)
      .exec();

    if (!employer)
      throw new NotFoundException(
        `A empresa com id: ${employerId} não existe.`,
      );

    await session.withTransaction(async () => {
      if (
        employer.favoriteCandidates?.some(
          (cdt) => String(cdt._id) === candidateId,
        )
      ) {
        await employer
          .updateOne(
            {
              $pull: { favoriteCandidates: candidateId },
            },
            {
              new: true,
            },
          )
          .populate(this.defaultPopulate)
          .exec();
      } else {
        await employer
          .updateOne(
            {
              $push: { favoriteCandidates: candidateId },
            },
            {
              new: true,
            },
          )
          .populate(this.defaultPopulate)
          .exec();
      }

      await this.employeeService.toggleEmployerFavorite(
        employerId,
        candidateId,
      );
    });

    return this.findById(employerId);
  }

  async getDashboard(employerId: string): Promise<IEmployerDashboard> {
    const sevenDaysAgo = subDays(new Date(), 7);
    const sixDaysAgo = subDays(new Date(), 6);
    const fiveDaysAgo = subDays(new Date(), 5);
    const fourDaysAgo = subDays(new Date(), 4);
    const threeDaysAgo = subDays(new Date(), 3);
    const twoDaysAgo = subDays(new Date(), 2);
    const oneDaysAgo = subDays(new Date(), 1);
    const today = new Date();

    const data: IEmployerDashboard = (
      await this.employerModel.aggregate([
        {
          $match: {
            _id: new ObjectId(employerId),
          },
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobs',
            foreignField: '_id',
            as: 'jobs',
            pipeline: [
              {
                $lookup: {
                  from: 'jobsteps',
                  localField: 'steps',
                  foreignField: '_id',
                  as: 'steps',
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            jobs: 1,
            totalJobs: {
              $cond: {
                if: { $isArray: '$jobs' },
                then: { $size: '$jobs' },
                else: 0,
              },
            },
            totalFavorite: {
              $cond: {
                if: { $isArray: '$favoriteCandidates' },
                then: { $size: '$favoriteCandidates' },
                else: 0,
              },
            },
          },
        },
        { $unwind: '$jobs' },
        {
          $project: {
            _id: 1,
            totalJobs: 1,
            jobInProgress: 1,
            jobOccupationsQuantityOpen: 1,
            jobOccupationsQuantityFinished: 1,
            totalFavorite: 1,
            newCandidatesTotal: { $size: '$jobs.participants' },
            totalFavorited: 1,
            jobs: 1,
          },
        },
        {
          $group: {
            _id: '$_id',
            totalJobs: { $first: '$totalJobs' },
            totalNewCandidates: { $sum: '$newCandidatesTotal' },
            totalFavorite: { $first: '$totalFavorite' },
            jobInProgressTotal: {
              $sum: {
                $cond: {
                  if: { $eq: ['$jobs.closed', false] },
                  then: 1,
                  else: 0,
                },
              },
            },
            jobOccupationsQuantityFinished: {
              $sum: {
                $cond: {
                  if: { $eq: ['$jobs.closed', true] },
                  then: '$jobs.quantity',
                  else: 0,
                },
              },
            },
            jobOccupationsQuantityOpen: {
              $sum: {
                $cond: {
                  if: { $eq: ['$jobs.closed', false] },
                  then: '$jobs.quantity',
                  else: 0,
                },
              },
            },
            jobs: { $push: '$jobs' },
          },
        },
        {
          $unwind: {
            path: '$jobs',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$jobs.participants',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            totalJobs: 1,
            totalNewCandidates: 1,
            totalFavorite: 1,
            jobInProgressTotal: 1,
            jobOccupationsQuantityOpen: 1,
            jobOccupationsQuantityFinished: 1,
            sevenDaysCandidates: {
              $dateDiff: {
                startDate: '$jobs.participants.createdAt',
                endDate: sevenDaysAgo,
                unit: 'day',
              },
            },
            sixDaysCandidates: {
              $dateDiff: {
                startDate: '$jobs.participants.createdAt',
                endDate: sixDaysAgo,
                unit: 'day',
              },
            },
            fiveDaysCandidates: {
              $dateDiff: {
                startDate: '$jobs.participants.createdAt',
                endDate: fiveDaysAgo,
                unit: 'day',
              },
            },
            fourDaysCandidates: {
              $dateDiff: {
                startDate: '$jobs.participants.createdAt',
                endDate: fourDaysAgo,
                unit: 'day',
              },
            },
            threeDaysCandidates: {
              $dateDiff: {
                startDate: '$jobs.participants.createdAt',
                endDate: threeDaysAgo,
                unit: 'day',
              },
            },
            twoDaysCandidates: {
              $dateDiff: {
                startDate: '$jobs.participants.createdAt',
                endDate: twoDaysAgo,
                unit: 'day',
              },
            },
            oneDaysCandidates: {
              $dateDiff: {
                startDate: '$jobs.participants.createdAt',
                endDate: oneDaysAgo,
                unit: 'day',
              },
            },
            todayDaysCandidates: {
              $dateDiff: {
                startDate: '$jobs.participants.createdAt',
                endDate: today,
                unit: 'day',
              },
            },
          },
        },
        {
          $group: {
            _id: '$_id',
            totalJobs: { $first: '$totalJobs' },
            totalNewCandidates: { $first: '$totalNewCandidates' },
            totalFavorite: { $first: '$totalFavorite' },
            jobInProgressTotal: {
              $first: '$jobInProgressTotal',
            },
            jobOccupationsQuantityOpen: {
              $first: '$jobOccupationsQuantityOpen',
            },
            jobOccupationsQuantityFinished: {
              $first: '$jobOccupationsQuantityFinished',
            },
            sevenDaysCandidates: {
              $sum: {
                $cond: {
                  if: { $eq: ['$sevenDaysCandidates', 1] },
                  then: 1,
                  else: 0,
                },
              },
            },
            sixDaysCandidates: {
              $sum: {
                $cond: {
                  if: { $eq: ['$sixDaysCandidates', 1] },
                  then: 1,
                  else: 0,
                },
              },
            },
            fiveDaysCandidates: {
              $sum: {
                $cond: {
                  if: { $eq: ['$fiveDaysCandidates', 1] },
                  then: 1,
                  else: 0,
                },
              },
            },
            fourDaysCandidates: {
              $sum: {
                $cond: {
                  if: { $eq: ['$fourDaysCandidates', 1] },
                  then: 1,
                  else: 0,
                },
              },
            },
            threeDaysCandidates: {
              $sum: {
                $cond: {
                  if: { $eq: ['$threeDaysCandidates', 1] },
                  then: 1,
                  else: 0,
                },
              },
            },
            twoDaysCandidates: {
              $sum: {
                $cond: {
                  if: { $eq: ['$twoDaysCandidates', 1] },
                  then: 1,
                  else: 0,
                },
              },
            },
            oneDaysCandidates: {
              $sum: {
                $cond: {
                  if: { $eq: ['$oneDaysCandidates', 1] },
                  then: 1,
                  else: 0,
                },
              },
            },
            todayDaysCandidates: {
              $sum: {
                $cond: {
                  if: { $eq: ['$todayDaysCandidates', 1] },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalJobs: 1,
            totalNewCandidates: 1,
            totalFavorite: 1,
            jobInProgressTotal: 1,
            jobOccupationsQuantityOpen: 1,
            jobOccupationsQuantityFinished: 1,
            lastDaysCandidates: {
              total: {
                $sum: [
                  '$sevenDaysCandidates',
                  '$sixDaysCandidates',
                  '$fiveDaysCandidates',
                  '$fourDaysCandidates',
                  '$threeDaysCandidates',
                  '$twoDaysCandidates',
                  '$oneDaysCandidates',
                  '$todayDaysCandidates',
                ],
              },
              data: [
                this.getLastDaysData(
                  format(sixDaysAgo, 'eee', { locale: ptBR }).toLowerCase(),
                  '$sixDaysCandidates',
                  formatISO(sixDaysAgo),
                ),
                this.getLastDaysData(
                  format(fiveDaysAgo, 'eee', { locale: ptBR }).toLowerCase(),
                  '$fiveDaysCandidates',
                  formatISO(fiveDaysAgo),
                ),
                this.getLastDaysData(
                  format(fourDaysAgo, 'eee', { locale: ptBR }).toLowerCase(),
                  '$fourDaysCandidates',
                  formatISO(fourDaysAgo),
                ),
                this.getLastDaysData(
                  format(threeDaysAgo, 'eee', { locale: ptBR }).toLowerCase(),
                  '$threeDaysCandidates',
                  formatISO(threeDaysAgo),
                ),
                this.getLastDaysData(
                  format(twoDaysAgo, 'eee', { locale: ptBR }).toLowerCase(),
                  '$twoDaysCandidates',
                  formatISO(twoDaysAgo),
                ),
                this.getLastDaysData(
                  format(oneDaysAgo, 'eee', { locale: ptBR }).toLowerCase(),
                  '$oneDaysCandidates',
                  formatISO(oneDaysAgo),
                ),
                {
                  name: 'hoje',
                  value: '$todayDaysCandidates',
                  date: formatISO(today),
                },
              ],
            },
          },
        },
      ])
    )[0];

    if (data) return data;

    return {
      jobInProgressTotal: 0,
      lastDaysCandidates: {
        total: 0,
        data: [],
      },
      totalFavorite: 0,
      totalJobs: 0,
      totalNewCandidates: 0,
      jobOccupationsQuantityOpen: 0,
      jobOccupationsQuantityFinished: 0,
    };
  }

  private getLastDaysData(name: string, value: string, date: string) {
    return {
      name: name.slice(0, 3),
      value,
      date,
    };
  }

  async findAllPublicEmployers(
    slug: string,
    params?: PaginateOptions<IEmployer>,
  ) {
    const { ...paginateOptions } = params;
    const employerDefaultPaginateOptions: PaginateOptions<IEmployer> = {
      select: [
        '_id',
        'cnpj',
        'corporateName',
        'businessName',
        'active',
        'jobs',
      ],
      populate: [
        {
          path: 'user',
          model: 'User',
          select: 'email',
          populate: {
            path: 'role',
          },
        },
        ...this.jobsPopulate,
      ],
      lean: true,
    };

    const options = {
      ...defaultPaginateOptions,
      ...employerDefaultPaginateOptions,
      ...paginateOptions,
      populate: this.jobsPopulate,
    };

    const search = {
      slug: slug,
      ...(params?.filterQuery || {}),
    };

    const data = await this.employerModel.paginate(search, options);

    const docs = data.docs;

    if (!search) return { ...data, docs };
    else return docs;
  }
}
