import { Injectable } from '@nestjs/common';
import learnWoldsApi from './infra/api';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PinoService } from '@modules/logger/pino.service';
import { EmployeeService } from '@modules/employee/employee.service';
import { NotFoundException } from '@shared/exceptions';
import { WebhookDTO } from './dto/webhook.dto';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class LearnWorldsService {
  baseApiUrl: string;

  constructor(
    private readonly userService: UserService,
    private readonly employeeService: EmployeeService,
    private readonly configService: ConfigService,
    private readonly logger: PinoService,
  ) {
    learnWoldsApi.interceptors.request.use(async (config) => {
      const accessData = await this.auth();

      return {
        ...config,
        headers: {
          ...config.headers,
          'Lw-Client': this.configService.get('LEARN_WORLDS_CLIENT_ID'),
          Authorization: `${accessData.token_type} ${accessData.access_token}`,
        },
      } as any;
    });

    this.baseApiUrl = this.configService.get('LEARN_WORLDS_API_URL');
  }

  async auth() {
    try {
      const {
        data: { tokenData: accessData },
      } = await axios.post(
        `${this.baseApiUrl}/oauth2/access_token`,
        {
          client_id: this.configService.get('LEARN_WORLDS_CLIENT_ID'),
          client_secret: this.configService.get('LEARN_WORLDS_CLIENT_SECRET'),
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Lw-Client': this.configService.get('LEARN_WORLDS_CLIENT_ID'),
          },
        },
      );

      this.logger.log('LEARN WORLDS - Get access data');

      return accessData as {
        access_token: string;
        expires_in: number;
        token_type: string;
      };
    } catch (error) {
      this.logger.error(
        'LEARN WORLDS - erro to get access data',
        error.response,
      );

      throw error;
    }
  }

  async sso(employeeId: string) {
    const redirectUrl = this.configService.get('LEARN_WORLDS_REDIRECT_URL');

    const employee = await this.employeeService.findByUserId(employeeId);

    if (!employee) {
      this.logger.error('LEARN WORLDS - employee not found', {
        employeeId,
      });

      throw new NotFoundException('Employee not found');
    }

    const bodyData = {
      email: employee.user.email,
      username: `${employee.firstName}.${employee.lastName}`,
      avatar: '',
      redirectUrl: redirectUrl,
    };

    try {
      const { data: ssoData } = await learnWoldsApi.post(
        `${this.baseApiUrl}/sso`,
        bodyData,
      );

      this.logger.log('LEARN WORLDS - Login SSO success');

      await this.employeeService.updateEmployeeById(employeeId, {
        learnWorldsUserId: ssoData.user_id,
      });

      return {
        redirectUrl: ssoData.url,
      };
    } catch (error) {
      this.logger.error('LEARN WORLDS - erro to get sso data', error.response);

      throw error;
    }
  }

  awardedCertificate({ data }: { data: WebhookDTO }) {
    return this.courseCompleted(data);
  }

  async courseCompleted({ data: { user } }: WebhookDTO) {
    const { email } = user;

    const userInfo = await this.userService.findByEmail(email);

    if (!userInfo) {
      return this.logger.log(
        'LEARN WORLDS/WEBHOOK - [courseCompleted] employee not found',
        {
          email,
        },
      );
    }

    await this.employeeService.updateEmployeeByUserId(userInfo._id, {
      learnWorldsUserCourseCompleted: true,
    });

    return this.logger.log(
      'LEARN WORLDS/WEBHOOK - [courseCompleted] employee update',
      {
        email: userInfo.email,
      },
    );
  }

  async syncUserProfile(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new Error(`user not found: ${email}`);
    }

    try {
      const {
        data: { data },
      } = await learnWoldsApi.get(
        `${this.baseApiUrl}/v2/certificates?user_id=${email}`,
      );

      const haveUserToUpdate = data.some(
        (certificate) => certificate.user.email === email,
      );

      if (!haveUserToUpdate) {
        throw new Error(`not found any one user to updated`);
      }

      await this.employeeService.updateEmployeeByUserId(user._id, {
        learnWorldsUserCourseCompleted: true,
      });

      this.logger.log(
        `LEARN WORLDS - [syncUserProfile] User Updated: ${email}`,
      );
    } catch (error) {
      this.logger.log(
        `LEARN WORLDS - [syncUserProfile] Learn Worlds error ${
          error.message as string
        }`,
      );
    }
  }
}
