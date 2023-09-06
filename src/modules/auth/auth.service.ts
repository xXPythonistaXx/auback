import { CONFIG } from '@config/index';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocument } from '@schemas';
import { DefaultRoles, ErrorCodes } from '@shared/enums';
import {
  ExpiredRefreshTokenException,
  ExpiredTokenException,
  UserNotRegisteredException,
  UserRegisteredFromThirdOauthException,
} from '@shared/exceptions';
import {
  compare as compareHash,
  encrypt,
  generateExpirationDate,
  generateRandomNumber,
} from '@shared/helpers';
import {
  ConfirmEmailPayload,
  IEmployeePayload,
  IEmployerPayload,
  ISignin,
  ISigninPayload,
  ITokenParsePayload,
  ITokenPayload,
  IUserWithoutPass,
} from '@shared/interfaces';
import { compare } from 'bcrypt';
import { ObjectId } from 'bson';
import { randomUUID } from 'crypto';
import { differenceInMinutes, isBefore, parseISO } from 'date-fns';
import {
  AppTokenException,
  FacebookAuthService,
  InvalidUserException,
} from 'facebook-auth-nestjs';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { EmployeeService } from '../employee/employee.service';
import { EmployerService } from '../employer/employer.service';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { GoogleAuthenticationService } from './google.service';

@Injectable()
export class AuthService {
  encryptSecret: string;

  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly employeeService: EmployeeService,
    private readonly employerService: EmployerService,
    private readonly googleAuthService: GoogleAuthenticationService,
    private readonly facebookService: FacebookAuthService,
  ) {
    this.encryptSecret = configService.get<string>(CONFIG.ENCRYPT_SECRET);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<IUserWithoutPass> {
    const user = await this.userService.findByEmail(email);

    if (user) {
      if (user.password) {
        if (await compare(password, user.password)) {
          if (!user.emailConfirmed) {
            const timeLimit = differenceInMinutes(
              new Date(),
              new Date(user.emailConfirmationExpiration),
            );
            if (timeLimit < 5) {
              throw new BadRequestException({
                errorCode: ErrorCodes.CONFIRMATION_EMAIL_ALREADY_SENT,
                message:
                  'O e-mail de confirmação já foi enviado! Verifique sua caixa de entrada.',
              });
            }
            void this.resendEmailConfirmation(
              user.email,
              user._id,
              user.role.name,
            );

            throw new UnauthorizedException({
              errorCode: ErrorCodes.EMAIL_NOT_CONFIRMED,
              message:
                'Email não confirmado. Foi enviado um novo código de verificação para seu email.',
            });
          }

          delete user.password;
          return user;
        }
        return null;
      }
      if (user.googleId || user.facebookId)
        throw new UserRegisteredFromThirdOauthException();
    }
    return null;
  }

  async signin({ _id, entityId, ...rest }: ISignin): Promise<ISigninPayload> {
    if (!entityId) {
      let entity: IEmployeePayload | IEmployerPayload;

      if (rest.role === DefaultRoles.employee) {
        entity = await this.employeeService.findByUserId(_id);
      } else {
        entity = await this.employerService.findByUserId(_id);
      }
      entityId = String(entity._id);
    }
    const payload: ITokenPayload = { sub: _id, entityId: entityId, ...rest };
    const refreshToken = await this.generateRefreshToken({
      _id,
      entityId,
      ...rest,
    });
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const tokenData: ITokenPayload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: false,
        secret: this.configService.get<string>(CONFIG.REFRESH_TOKEN_SECRET),
      });

      const storedRefreshToken = await this.refreshTokenModel
        .findOne({
          user: tokenData.sub,
        })
        .lean();

      if (
        storedRefreshToken &&
        compareHash(
          refreshToken,
          storedRefreshToken.refreshToken,
          this.encryptSecret,
        )
      ) {
        return await this.signin({
          _id: tokenData.sub,
          email: tokenData.email,
          role: tokenData.role,
          entityId: tokenData.entityId,
        });
      }
      throw new ExpiredRefreshTokenException();
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new ExpiredRefreshTokenException();
      if (error instanceof JsonWebTokenError)
        throw new ExpiredRefreshTokenException();
      throw error;
    }
  }

  private async generateRefreshToken({
    _id,
    ...rest
  }: Required<ISignin>): Promise<string> {
    try {
      const payload: ITokenPayload = { sub: _id, ...rest };
      const refreshSecret = this.configService.get<string>(
        CONFIG.REFRESH_TOKEN_SECRET,
      );
      const refreshExpiresIn = this.configService.get<string>(
        CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      );
      const refreshToken = this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      });

      const hashedToken = encrypt(refreshToken, this.encryptSecret);

      const oldRefreshToken = await this.refreshTokenModel
        .findOneAndUpdate(
          {
            user: _id,
          },
          {
            refreshToken: hashedToken,
          },
        )
        .lean();

      if (oldRefreshToken === null) {
        await new this.refreshTokenModel({
          user: _id,
          refreshToken: hashedToken,
          isRevoked: false,
        }).save();
      }
      return refreshToken;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async googleSignin(token: string) {
    try {
      if (!token) {
        throw new UserNotRegisteredException('Usuário inexistente no google.');
      }
      const { email, sub: userId } = await this.googleAuthService.getInfoToken(
        token,
      );

      let foundUser = await this.userService.findByEmail(email);

      if (!foundUser) {
        const employee = await this.employeeService.signupFromGoogle(
          token,
          true,
        );
        foundUser = employee.user;
      }
      if (foundUser?.role?.name !== DefaultRoles.employee)
        throw new BadRequestException({
          errorCode: ErrorCodes.EMPLOYER_ALREADY_REGISTERED,
          message:
            'Usuário cadastrado como empresa. Faça login pelo portal de empresas!',
        });
      if (foundUser && (!foundUser.googleId || foundUser.googleId !== userId)) {
        foundUser = await this.userService.updateUserByEmail(foundUser.email, {
          googleId: userId,
        });
      }

      let entity: IEmployeePayload | IEmployerPayload;

      if (foundUser.role.name === DefaultRoles.employee) {
        entity = await this.employeeService.findByUserId(foundUser._id);
      } else {
        entity = await this.employerService.findByUserId(foundUser._id);
      }

      return await this.signin({
        _id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role.name,
        entityId: entity._id,
      });
    } catch (error) {
      if (error?.response?.data?.error === 'invalid_token')
        throw new ExpiredTokenException();
      throw error;
    }
  }

  async facebookSignin(token: string) {
    try {
      if (!token) {
        throw new UserNotRegisteredException(
          'Usuário inexistente no facebook.',
        );
      }
      const { email, id: userId } = await this.facebookService.getUser(
        token,
        'id',
        'email',
      );

      let foundUser = await this.userService.findByEmail(email);

      if (!foundUser) {
        const employee = await this.employeeService.signupFromFacebook(
          token,
          true,
        );
        foundUser = employee.user;
      }
      if (foundUser?.role?.name !== DefaultRoles.employee)
        throw new BadRequestException({
          errorCode: ErrorCodes.EMPLOYER_ALREADY_REGISTERED,
          message:
            'Usuário cadastrado como empresa. Faça login pelo portal de empresas!',
        });
      if (
        foundUser &&
        (!foundUser.facebookId || foundUser.facebookId !== userId)
      ) {
        foundUser = await this.userService.updateUserByEmail(foundUser.email, {
          facebookId: userId,
        });
      }

      let entity: IEmployeePayload | IEmployerPayload;

      if (foundUser.role.name === DefaultRoles.employee) {
        entity = await this.employeeService.findByUserId(foundUser._id);
      } else {
        entity = await this.employerService.findByUserId(foundUser._id);
      }

      return await this.signin({
        _id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role.name,
        entityId: entity._id,
      });
    } catch (error) {
      if (
        error instanceof InvalidUserException ||
        error instanceof AppTokenException
      )
        throw new ExpiredTokenException();
      throw error;
    }
  }

  async requestResetPasswordCode(email: string) {
    const resetPasswordCode = randomUUID();
    const resetPasswordExpiration = generateExpirationDate(
      this.configService.get<number>(CONFIG.RESET_PASSWORD_TOKEN_EXPIRATION),
    );
    const user = await this.userService.updateUserByEmail(email, {
      resetPasswordCode,
      resetPasswordExpiration,
    });
    if (user) {
      if (!user.emailConfirmed) {
        void this.resendEmailConfirmation(user.email, user._id, user.role.name);
        throw new UnauthorizedException({
          errorCode: ErrorCodes.EMAIL_NOT_CONFIRMED,
          message:
            'Email não confirmado. Foi enviado um novo código de verificação para seu email.',
        });
      }

      let name = '';
      if (user.role.name === DefaultRoles.employee)
        name = (await this.employeeService.findByUserId(user._id)).firstName;
      if (user.role.name === DefaultRoles.employer)
        name = (await this.employerService.findByUserId(user._id))
          .corporateName;

      await this.mailService.sendPasswordResetCode(
        user.email,
        name,
        user._id,
        resetPasswordCode,
        user.role.name,
      );
    }
  }

  async resetPassword(token: string, userId: string, newPassword: string) {
    if (!token)
      throw new BadRequestException({
        errorCode: ErrorCodes.BAD_REQUEST,
        message: 'O token é obrigatório.',
      });
    if (!userId)
      throw new BadRequestException({
        errorCode: ErrorCodes.BAD_REQUEST,
        message: 'O userId é obrigatório.',
      });
    if (!ObjectId.isValid(userId))
      throw new BadRequestException({
        errorCode: ErrorCodes.BAD_REQUEST,
        message: 'userId inválido.',
      });

    const user = await this.userService.findById(userId);
    if (!user) throw new UserNotRegisteredException();

    const isPeriodValid = isBefore(
      parseISO(new Date().toISOString()),
      parseISO(user.resetPasswordExpiration),
    );

    if (!isPeriodValid) {
      await this.requestResetPasswordCode(user.email);
      throw new BadRequestException({
        errorCode: ErrorCodes.EXPIRED_TOKEN,
        message:
          'Token de recuperação expirado, foi enviado um novo token para seu email.',
      });
    }
    if (user.resetPasswordCode === token) {
      await this.userService.updateUserByEmail(user.email, {
        password: newPassword,
        resetPasswordCode: null,
        resetPasswordExpiration: null,
      });
      return;
    }
    await this.requestResetPasswordCode(user.email);
    throw new BadRequestException({
      errorCode: ErrorCodes.INVALID_TOKEN,
      message: 'Token inválido, foi enviado um novo token para seu email.',
    });
  }

  async getProfile(user: ITokenParsePayload) {
    if (user.role === DefaultRoles.employee) {
      const foundUser = await this.employeeService.findByUserId(user._id);
      return foundUser;
    }

    if (
      user.role === DefaultRoles.employer ||
      user.role === DefaultRoles.admin
    ) {
      return this.employerService.findByUserId(user._id);
    }

    throw new NotFoundException('Usuário não encontrado');
  }

  async confirmEmail(
    userId: string,
    token: string,
  ): Promise<ConfirmEmailPayload> {
    if (!token)
      throw new BadRequestException({
        errorCode: ErrorCodes.BAD_REQUEST,
        message: 'O token é obrigatório.',
      });
    if (!userId)
      throw new BadRequestException({
        errorCode: ErrorCodes.BAD_REQUEST,
        message: 'O userId é obrigatório.',
      });
    if (!ObjectId.isValid(userId))
      throw new BadRequestException({
        errorCode: ErrorCodes.BAD_REQUEST,
        message: 'userId inválido.',
      });

    const user = await this.userService.findById(userId);
    if (!user) throw new UserNotRegisteredException();
    if (user.emailConfirmed)
      throw new BadRequestException({
        errorCode: ErrorCodes.EMAIL_ALREADY_CONFIRMED,
        message: 'Email já confirmado!',
      });

    const isPeriodValid = isBefore(
      parseISO(new Date().toISOString()),
      parseISO(user.emailConfirmationExpiration),
    );

    if (!isPeriodValid) {
      void this.resendEmailConfirmation(user.email, user._id, user.role.name);
      throw new BadRequestException({
        errorCode: ErrorCodes.EXPIRED_TOKEN,
        message:
          'Token de confirmação expirado, foi enviado um novo token para seu email.',
      });
    }

    if (token === user.emailConfirmationCode) {
      await this.userService.updateUserByEmail(user.email, {
        emailConfirmationCode: '',
        emailConfirmationExpiration: '',
        emailConfirmed: true,
      });
      const entity =
        user.role.name === DefaultRoles.employee
          ? await this.employeeService.findByUserId(user._id)
          : await this.employerService.findByUserId(user._id);
      return {
        active: !!entity.active,
      };
    }

    void this.resendEmailConfirmation(user.email, user._id, user.role.name);
    throw new BadRequestException({
      errorCode: ErrorCodes.INVALID_TOKEN,
      message:
        'Token de confirmação inválido, foi enviado um novo token para seu email.',
    });
  }

  async resendEmailConfirmation(email: string, userId?: string, type?: string) {
    let name;

    if (!userId || !type) {
      const user = await this.userService.findByEmail(email);
      if (!user) throw new UserNotRegisteredException();
      if (user.emailConfirmed)
        throw new BadRequestException({
          errorCode: ErrorCodes.EMAIL_ALREADY_CONFIRMED,
          message: 'Email já confirmado!',
        });
      userId = user._id;
      type = user.role.name;
    }

    if (type === DefaultRoles.employee) {
      const employee = await this.employeeService.findByUserId(userId);
      name = employee.firstName;
    }

    if (type === DefaultRoles.employer) {
      const employer = await this.employerService.findByUserId(userId);
      name = employer.corporateName;
    }

    const emailConfirmationCode = generateRandomNumber();

    const emailConfirmationExpiration = generateExpirationDate(
      this.configService.get<number>(CONFIG.RESET_PASSWORD_TOKEN_EXPIRATION),
    );

    await this.userService.updateUserByEmail(email, {
      emailConfirmationCode,
      emailConfirmationExpiration,
    });

    await this.mailService.sendEmailConfirmation(
      email,
      name,
      userId,
      emailConfirmationCode,
    );
  }
}
