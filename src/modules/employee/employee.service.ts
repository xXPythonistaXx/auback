import { CONFIG } from '@config/index';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Employee, EmployeeDocument, Job, JobDocument } from '@schemas';
import { DefaultRoles, ErrorCodes, Events } from '@shared/enums';
import {
  UserNotRegisteredException,
  ValidationException,
} from '@shared/exceptions';
import { generateExpirationDate, generateRandomNumber } from '@shared/helpers';
import {
  AggregatePaginateModel,
  IAcademicBackgroundCreate,
  IAcademicBackgroundUpdate,
  ICertificateCreate,
  ICertificateUpdate,
  IEmployee,
  IEmployeeDashboard,
  IEmployeeLanguageCreate,
  IEmployeeLanguageUpdate,
  IEmployeePayload,
  IEmployeeToolCreate,
  IEmployeeToolUpdate,
  IEmployeeUpdate,
  IExperienceCreate,
  IExperienceUpdate,
  IImage,
  IJob,
  IUser,
  PaginateOptions,
} from '@shared/interfaces';
import { ObjectId, ObjectID, UUID } from 'bson';
import { format, formatISO, isEqual, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AppTokenException,
  FacebookAuthService,
  GetUserFieldsException,
  InvalidUserException,
} from 'facebook-auth-nestjs';
import { PaginateModel } from 'mongoose';
import { GoogleAuthenticationService } from '../auth/google.service';
import { RoleService } from '../authorization/role/role.service';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { LocalEmployeeSignupDTO } from './dto/employee-signup.dto';
import { EventsService } from '../events/events.service';
import { PinoService } from '../logger/pino.service';
import { validateProfileHasCompleted } from '@shared/helpers/validate-profile-completed.helper';

@Injectable()
export class EmployeeService {
  defaultPopulate = [
    {
      path: 'user',
      model: 'User',
      select: ['-password'],
    },
    {
      path: 'favoriteJobs',
      model: 'Job',
      populate: [
        {
          path: 'employer',
          model: 'Employer',
          select: [
            '_id',
            'cnpj',
            'corporateName',
            'businessName',
            'profileImage',
            '-user',
          ],
        },
        {
          path: 'steps',
          model: 'JobStep',
          populate: [
            {
              path: 'candidates',
              model: 'JobStepCandidate',
              populate: [
                {
                  path: 'reprovedStep',
                  model: 'JobStep',
                  select: ['_id', 'name'],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  profileImgPath: string;

  constructor(
    @InjectModel(Employee.name)
    private employeeModel: PaginateModel<EmployeeDocument>,
    @InjectModel(Job.name)
    private jobModel: AggregatePaginateModel<JobDocument>,
    private userService: UserService,
    private googleAuthService: GoogleAuthenticationService,
    private readonly facebookService: FacebookAuthService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
    private readonly s3Service: AwsS3Service,
    private readonly eventEmitter: EventsService,
    private readonly logger: PinoService,
  ) {
    this.profileImgPath = configService.get<string>(CONFIG.PROFILE_IMAGE_PATH);
  }

  private async isUserCreated(email: string, cpf?: string) {
    const createdEmployee = await this.employeeModel.findOne({
      $and: [{ cpf: { $ne: null } }, { cpf: { $eq: cpf } }],
    });

    const createdUser = await this.userService.findByEmail(email);
    const isUserCreated = !!createdEmployee || !!createdUser;
    if (isUserCreated && createdUser?.role?.name !== DefaultRoles.employee)
      throw new BadRequestException({
        errorCode: ErrorCodes.EMPLOYER_ALREADY_REGISTERED,
        message:
          'Usuário cadastrado como empresa. Faça login pelo portal de empresas!',
      });

    return isUserCreated;
  }

  async signup({ email, password, ...data }: LocalEmployeeSignupDTO) {
    try {
      const emailConfirmationCode = generateRandomNumber();

      const emailConfirmationExpiration = generateExpirationDate(
        this.configService.get<number>(CONFIG.RESET_PASSWORD_TOKEN_EXPIRATION),
      );

      const employee = await this.createEmployee(
        {
          email,
          password,
          emailConfirmationCode,
          emailConfirmationExpiration,
        },
        data,
      );

      await this.mailService.sendEmailConfirmation(
        email,
        employee.firstName,
        employee.user._id,
        emailConfirmationCode,
      );

      this.eventEmitter.emitEvent(Events.CLIENT_CREATED, employee);

      this.logger.log(
        `Employee created and dispatch event ${Events.CLIENT_CREATED}`,
      );
    } catch (error) {
      throw error;
    }
  }

  async signupFromGoogle(token: string, returnUserData = false) {
    try {
      const {
        email,
        given_name: firstName,
        family_name: lastName,
        picture: url,
      } = await this.googleAuthService.getUserData(token);
      const { sub: googleId } = await this.googleAuthService.getInfoToken(
        token,
      );

      if (!email || !googleId)
        throw new UserNotRegisteredException('Usuário não registrado.');

      const employee = await this.createEmployee(
        { email, googleId, emailConfirmed: true },
        { firstName, lastName, profileImage: { location: url } },
      );
      if (returnUserData) return employee;
    } catch (error) {
      if (error?.response?.data?.error === 'invalid_token')
        throw new BadRequestException(
          'Aconteceu algum problema na comunicação com o google. Tente novamente.',
        );
      if (error?.response?.data?.error)
        throw new BadRequestException(
          'Aconteceu algum problema na comunicação com o google. Tente novamente.',
        );
      throw error;
    }
  }

  async signupFromFacebook(token: string, returnUserData = false) {
    try {
      const {
        email,
        id: facebookId,
        first_name: firstName,
        last_name: lastName,
        picture: profileImage,
      } = await this.facebookService.getUser(
        token,
        'id',
        'email',
        'first_name',
        'last_name',
        'picture' as unknown as any,
      );

      if (!email || !facebookId)
        throw new UserNotRegisteredException('Usuário não registrado.');

      const employee = await this.createEmployee(
        { email, facebookId, emailConfirmed: true },
        {
          firstName,
          lastName,
          profileImage: { location: profileImage?.data?.url },
        },
      );
      if (returnUserData) return employee;
    } catch (error) {
      if (
        error instanceof InvalidUserException ||
        error instanceof AppTokenException ||
        error instanceof GetUserFieldsException
      )
        throw new BadRequestException(
          'Aconteceu algum problema na comunicação com o facebook. Tente novamente.',
        );

      throw error;
    }
  }

  async createEmployee(
    userData: Omit<IUser, 'type' | 'role'>,
    employeeData: Omit<IEmployee, 'user'>,
  ) {
    const isUserCreated = await this.isUserCreated(
      userData.email,
      employeeData.cpf,
    );

    if (isUserCreated)
      throw new BadRequestException({
        errorCode: ErrorCodes.EMPLOYEE_ALREADY_REGISTERED,
        message: 'Candidato já está cadastrado!',
      });
    const role = await this.roleService.findRoleByName(DefaultRoles.employee);
    const user = await this.userService.createUser({
      ...userData,
      role: role._id,
    });

    const lastEmployee = await this.employeeModel
      .findOne({}, {}, { sort: { externalId: -1 } })
      .exec();

    const employee = this.employeeModel.create({
      ...employeeData,
      active: true,
      user: user._id,
      externalId: lastEmployee ? lastEmployee.externalId + 1 : 0,
    });

    return (await employee).populate({
      path: 'user',
      populate: {
        path: 'role',
        model: 'Role',
        populate: {
          path: 'permissions',
          model: 'Permission',
          populate: {
            path: 'subject',
            model: 'Subject',
          },
        },
      },
    });
  }

  findAllEmployees(params?: PaginateOptions<Employee>) {
    const { q, filterQuery, ...paginateOptions } = params;

    const options = {
      populate: this.defaultPopulate,
      ...paginateOptions,
    };

    let search = {};

    if (q) {
      search = {
        $or: [
          { firstName: { $regex: new RegExp(q, 'i') } },
          { lastName: { $regex: new RegExp(q, 'i') } },
        ],
      };
    }

    if (filterQuery) search = filterQuery;

    return this.employeeModel.paginate(search, options);
  }

  async findByUserId(
    userId: string,
    withPassword = false,
  ): Promise<IEmployeePayload> {
    const employee = await this.employeeModel
      .findOne({
        user: userId,
      })
      .populate(this.defaultPopulate);

    if (!withPassword) delete employee.user.password;

    return employee;
  }

  async findById(id: string, withPassword = false): Promise<IEmployeePayload> {
    const employee = await this.employeeModel
      .findById(id)
      .populate(this.defaultPopulate);

    if (!withPassword) delete employee.user.password;
    return employee;
  }

  async getDashboard(employeeId: string) {
    const sevenDaysAgo = subDays(new Date(), 7);
    const sixDaysAgo = subDays(new Date(), 6);
    const fiveDaysAgo = subDays(new Date(), 5);
    const fourDaysAgo = subDays(new Date(), 4);
    const threeDaysAgo = subDays(new Date(), 3);
    const twoDaysAgo = subDays(new Date(), 2);
    const oneDaysAgo = subDays(new Date(), 1);
    const employee = await this.findById(employeeId);
    const jobs: IJob[] = await this.jobModel.aggregate([
      {
        $lookup: {
          from: 'jobsteps',
          localField: 'steps',
          foreignField: '_id',
          as: 'steps',
        },
      },
      {
        $lookup: {
          from: 'employers',
          localField: 'employer',
          foreignField: '_id',
          as: 'employer',
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
      {
        $match: {
          $or: [
            {
              'steps.candidates._id': {
                $eq: new ObjectId(employeeId),
              },
            },
            {
              'newCandidates._id': {
                $eq: new ObjectId(employeeId),
              },
            },
          ],
        },
      },
    ]);

    const sevenDaysAgoJobs = jobs.filter((job) =>
      job.newCandidates.some((newCdt) =>
        isEqual(
          parseISO(format(new Date(newCdt.createdAt), 'yyyy-MM-dd')),
          parseISO(format(sevenDaysAgo, 'yyyy-MM-dd')),
        ),
      ),
    ).length;
    const sixDaysAgoJobs = jobs.filter((job) =>
      job.newCandidates.some((newCdt) =>
        isEqual(
          parseISO(format(new Date(newCdt.createdAt), 'yyyy-MM-dd')),
          parseISO(format(sixDaysAgo, 'yyyy-MM-dd')),
        ),
      ),
    ).length;
    const fiveDaysAgoJobs = jobs.filter((job) =>
      job.newCandidates.some((newCdt) =>
        isEqual(
          parseISO(format(new Date(newCdt.createdAt), 'yyyy-MM-dd')),
          parseISO(format(fiveDaysAgo, 'yyyy-MM-dd')),
        ),
      ),
    ).length;
    const fourDaysAgoJobs = jobs.filter((job) =>
      job.newCandidates.some((newCdt) =>
        isEqual(
          parseISO(format(new Date(newCdt.createdAt), 'yyyy-MM-dd')),
          parseISO(format(fourDaysAgo, 'yyyy-MM-dd')),
        ),
      ),
    ).length;
    const threeDaysAgoJobs = jobs.filter((job) =>
      job.newCandidates.some((newCdt) =>
        isEqual(
          parseISO(format(new Date(newCdt.createdAt), 'yyyy-MM-dd')),
          parseISO(format(threeDaysAgo, 'yyyy-MM-dd')),
        ),
      ),
    ).length;
    const twoDaysAgoJobs = jobs.filter((job) =>
      job.newCandidates.some((newCdt) =>
        isEqual(
          parseISO(format(new Date(newCdt.createdAt), 'yyyy-MM-dd')),
          parseISO(format(twoDaysAgo, 'yyyy-MM-dd')),
        ),
      ),
    ).length;
    const oneDaysAgoJobs = jobs.filter((job) =>
      job.newCandidates.some((newCdt) =>
        isEqual(
          parseISO(format(new Date(newCdt.createdAt), 'yyyy-MM-dd')),
          parseISO(format(oneDaysAgo, 'yyyy-MM-dd')),
        ),
      ),
    ).length;
    const todayJobs = jobs.filter((job) =>
      job.newCandidates.some((newCdt) =>
        isEqual(
          parseISO(format(new Date(newCdt.createdAt), 'yyyy-MM-dd')),
          parseISO(format(new Date(), 'yyyy-MM-dd')),
        ),
      ),
    ).length;

    const data: IEmployeeDashboard = {
      inProggressTotal: jobs.filter((job) => job.closed === false).length,
      totalJobs: jobs.length,
      totalNewJobs: jobs.filter((job) =>
        job.newCandidates.some((newCdt) => String(newCdt._id) === employeeId),
      ).length,
      totalFavorited: employee.favoriteJobs?.length || 0,
      lastDaysCandidates: {
        total:
          sevenDaysAgoJobs +
          sixDaysAgoJobs +
          fiveDaysAgoJobs +
          fourDaysAgoJobs +
          threeDaysAgoJobs +
          twoDaysAgoJobs +
          oneDaysAgoJobs +
          todayJobs,
        data: [
          this.getLastDaysData(
            format(sixDaysAgo, 'EEEE', { locale: ptBR }).toLowerCase(),
            sixDaysAgoJobs,
            formatISO(sixDaysAgo),
          ),
          this.getLastDaysData(
            format(fiveDaysAgo, 'EEEE', { locale: ptBR }).toLowerCase(),
            fiveDaysAgoJobs,
            formatISO(fiveDaysAgo),
          ),
          this.getLastDaysData(
            format(fourDaysAgo, 'EEEE', { locale: ptBR }).toLowerCase(),
            fourDaysAgoJobs,
            formatISO(fourDaysAgo),
          ),
          this.getLastDaysData(
            format(threeDaysAgo, 'EEEE', { locale: ptBR }).toLowerCase(),
            threeDaysAgoJobs,
            formatISO(threeDaysAgo),
          ),
          this.getLastDaysData(
            format(twoDaysAgo, 'EEEE', { locale: ptBR }).toLowerCase(),
            twoDaysAgoJobs,
            formatISO(twoDaysAgo),
          ),
          this.getLastDaysData(
            format(oneDaysAgo, 'EEEE', { locale: ptBR }).toLowerCase(),
            oneDaysAgoJobs,
            formatISO(oneDaysAgo),
          ),
          {
            name: 'hoje',
            value: todayJobs,
            date: formatISO(new Date()),
          },
        ],
      },
    };

    return data;
  }

  private getLastDaysData(name: string, value: number, date: string) {
    return {
      name: name.slice(0, 3),
      value,
      date,
    };
  }

  async updateEmployeeById(id: string, newData: IEmployeeUpdate) {
    return this.employeeModel
      .findOneAndUpdate({ id }, newData, {
        lean: true,
        new: true,
      })
      .lean({ autopopulate: true })
      .exec();
  }

  async updateEmployeeByUserId(userId: string, newData: IEmployeeUpdate) {
    const employeeUpdated = await this.employeeModel
      .findOneAndUpdate({ user: userId }, newData, {
        new: true,
      })
      .populate(this.defaultPopulate)
      .exec();

    this.eventEmitter.emitEvent(Events.CLIENT_UPDATED, employeeUpdated);
    return employeeUpdated;
  }

  async updateProfileImage(userId: string, image: IImage) {
    const path = `${this.profileImgPath}profile-img-${new UUID().toString()}`;
    const user = await this.findByUserId(userId);

    if (user?.profileImage?.key) {
      await this.s3Service.removeMedia(user.profileImage.key);
    }

    const { location, key } = await this.s3Service.uploadMedia(image, path);

    return this.employeeModel
      .findOneAndUpdate(
        { user: userId },
        { profileImage: { key, location } },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async addEmployeeAcademicBackground(
    userId: string,
    academicBackground: IAcademicBackgroundCreate,
  ) {
    if (!ObjectID.isValid(academicBackground.university))
      throw new ValidationException('id', 'O id precisa ser um objectID');

    return this.employeeModel
      .findOneAndUpdate(
        { user: userId },
        {
          $push: {
            academicBackgrounds: academicBackground,
          },
        },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async updateEmployeeAcademicBackground(
    userId: string,
    academicBackground: IAcademicBackgroundUpdate,
  ) {
    const fieldToUpdate = Object.keys(academicBackground).reduce(
      (prev, next) => {
        return {
          ...prev,
          [`academicBackgrounds.$.${next}`]: academicBackground[next],
        };
      },
      {},
    );
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
          'academicBackgrounds._id': academicBackground._id,
        },
        { $set: fieldToUpdate },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async deleteEmployeeAcademicBackground(
    userId: string,
    academicBackgroundId: string,
  ) {
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $pull: { academicBackgrounds: { _id: academicBackgroundId } } },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async addEmployeeExperience(userId: string, experience: IExperienceCreate) {
    return this.employeeModel
      .findOneAndUpdate(
        { user: userId },
        {
          $push: {
            experiences: experience,
          },
        },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async updateEmployeeExperience(
    userId: string,
    experience: IExperienceUpdate,
  ) {
    const fieldToUpdate = Object.keys(experience).reduce((prev, next) => {
      return {
        ...prev,
        [`experiences.$.${next}`]: experience[next],
      };
    }, {});
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
          'experiences._id': experience._id,
        },
        { $set: fieldToUpdate },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async deleteEmployeeExperience(userId: string, experienceId: string) {
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $pull: { experiences: { _id: experienceId } } },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async addEmployeeLanguage(userId: string, language: IEmployeeLanguageCreate) {
    return this.employeeModel
      .findOneAndUpdate(
        { user: userId },
        {
          $push: {
            languages: language,
          },
        },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async updateEmployeeLanguage(
    userId: string,
    language: IEmployeeLanguageUpdate,
  ) {
    const fieldToUpdate = Object.keys(language).reduce((prev, next) => {
      return {
        ...prev,
        [`languages.$.${next}`]: language[next],
      };
    }, {});
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
          'languages._id': language._id,
        },
        { $set: fieldToUpdate },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async deleteEmployeeLanguage(userId: string, languageId: string) {
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $pull: { languages: { _id: languageId } } },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async addEmployeeTool(userId: string, tool: IEmployeeToolCreate) {
    return this.employeeModel
      .findOneAndUpdate(
        { user: userId },
        {
          $push: {
            tools: tool,
          },
        },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async updateEmployeeTool(userId: string, tool: IEmployeeToolUpdate) {
    const fieldToUpdate = Object.keys(tool).reduce((prev, next) => {
      return {
        ...prev,
        [`tools.$.${next}`]: tool[next],
      };
    }, {});
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
          'tools._id': tool._id,
        },
        { $set: fieldToUpdate },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async deleteEmployeeTool(userId: string, toolId: string) {
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $pull: { tools: { _id: toolId } } },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async addEmployeeCertificate(
    userId: string,
    certificate: ICertificateCreate,
  ) {
    return this.employeeModel
      .findOneAndUpdate(
        { user: userId },
        {
          $push: {
            certificates: certificate,
          },
        },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async updateEmployeeCertificate(
    userId: string,
    certificate: ICertificateUpdate,
  ) {
    const fieldToUpdate = Object.keys(certificate).reduce((prev, next) => {
      return {
        ...prev,
        [`certificates.$.${next}`]: certificate[next],
      };
    }, {});
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
          'certificates._id': certificate._id,
        },
        { $set: fieldToUpdate },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async deleteEmployeeCertificate(userId: string, certificateId: string) {
    return this.employeeModel
      .findOneAndUpdate(
        {
          user: userId,
        },
        { $pull: { certificates: { _id: certificateId } } },
        {
          new: true,
        },
      )
      .populate(this.defaultPopulate)
      .exec();
  }

  async toggleJobFavorite(jobId: string, employeeId: string) {
    const candidate = await this.employeeModel
      .findById(employeeId)
      .populate(this.defaultPopulate);

    if (!candidate)
      throw new NotFoundException(
        `O candidato com id: ${employeeId} não existe.`,
      );

    if (!candidate.favoriteJobs?.some((job) => String(job._id) === jobId)) {
      return candidate
        .updateOne(
          {
            $push: { favoriteJobs: jobId },
          },
          {
            new: true,
          },
        )
        .exec();
    } else {
      return candidate.updateOne(
        {
          $pull: { favoriteJobs: jobId },
        },
        {
          new: true,
        },
      );
    }
  }

  async toggleEmployerFavorite(employerId: string, employeeId: string) {
    const candidate = await this.employeeModel
      .findById(employeeId)
      .populate(this.defaultPopulate);

    if (!candidate)
      throw new NotFoundException(
        `O candidato com id: ${employeeId} não existe.`,
      );

    if (
      !candidate.employersFavorite?.some(
        (employer) => String(employer) === employerId,
      )
    ) {
      return candidate
        .updateOne(
          {
            $push: { employersFavorite: employerId },
          },
          {
            new: true,
          },
        )
        .exec();
    } else {
      return candidate.updateOne(
        {
          $pull: { employersFavorite: employerId },
        },
        {
          new: true,
        },
      );
    }
  }

  async updateEmployeeCurriculum(userId: string, pdf: Express.Multer.File) {
    if (pdf.mimetype !== 'application/pdf') {
      throw new Error('O arquivo deve ser do tipo PDF');
    }

    try {
      const path = `pdfs/profile/${new UUID().toString()}.pdf`;
      const user = await this.findByUserId(userId);

      if (user?.pdf?.key) {
        await this.s3Service.removeMedia(user.pdf.key);
      }

      const { location, key } = await this.s3Service.uploadMedia(
        pdf,
        path,
        'application/pdf',
      );

      return await this.employeeModel
        .findOneAndUpdate(
          { user: userId },
          { pdf: { key, location } },
          {
            new: true,
          },
        )
        .populate(this.defaultPopulate)
        .exec();
    } catch (error) {
      throw new Error(
        `Não foi possível atualizar o PDF do usuário: ${
          (error as Error).message
        }`,
      );
    }
  }

  async findByExternalId(externalId: string): Promise<IEmployeePayload> {
    const employee = await this.employeeModel
      .findOne({
        externalId: externalId,
      })
      .populate(this.defaultPopulate);

    if (!employee.$isEmpty) {
      delete employee.user.password;
    }
    return employee;
  }

  async getEmployeeStatistics(completeLearnInfo: boolean) {
    try {
      const employees = await this.employeeModel.find();
      const totalEmployees = await this.employeeModel.countDocuments();
      const incompleteProfiles = await this.employeeModel
        .find({
          learnWorldsUserCourseCompleted: false,
        })
        .populate('user');

      const employeesWithCompletedProfiles = [];

      const employeesWithUncompletedProfiles = [];

      for (const employee of employees) {
        const profileCompletionStatus = await validateProfileHasCompleted(
          employee,
        );
        if (!profileCompletionStatus.hasCompletedProfile) {
          employeesWithUncompletedProfiles.push(employee);
        } else {
          employeesWithCompletedProfiles.push(employee);
        }
      }

      const result = {
        totalEmployees: totalEmployees,
        completedProfiles: employeesWithCompletedProfiles.length,
        uncompletedProfiles: employeesWithUncompletedProfiles.length,
        uncompletedLearWorld: incompleteProfiles.length,
        notCompletedLearnEmployeeInfo: [],
      };

      if (completeLearnInfo) {
        const simplifiedEmployeeInfo = incompleteProfiles.map((employee) => ({
          candidate: `${employee.firstName} ${employee.lastName}`,
          email: employee.user?.email,
        }));

        result.notCompletedLearnEmployeeInfo = simplifiedEmployeeInfo;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}
