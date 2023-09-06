/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { CONFIG } from '@config/index';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AccessData, ContactPayload } from '@shared/interfaces';
import { Cache } from 'cache-manager';
import rdStationApi from './infra/api';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import { ErrorCodes } from '@shared/enums';
import { PinoService } from '@modules/logger/pino.service';

@Injectable()
export class RdStationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly logger: PinoService,
  ) {
    rdStationApi.interceptors.request.use(async (config) => {
      const accessToken = await this.refreshAccessToken();
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      } as any;
    });
  }

  async refreshAccessToken() {
    const cacheData: string = await this.cacheManager.get('access_data');

    if (!cacheData) {
      return '' as string;
    }
    const accessParsed: AccessData = JSON.parse(cacheData);

    if (!accessParsed?.refresh_token) {
      return '' as string;
    }

    const jsonBodyData = {
      refresh_token: accessParsed.refresh_token || '',
      client_id: this.configService.get('RD_STATION_CLIENT_ID'),
      client_secret: this.configService.get('RD_STATION_CLIENT_SECRET'),
    };

    const { data: currentAccessData } = await axios.post(
      'https://api.rd.services/auth/token',
      jsonBodyData,
    );

    const accessData = JSON.stringify(currentAccessData);

    await this.cacheManager.set('access_data', accessData);

    return currentAccessData.access_token as AxiosRequestConfig;
  }

  async postContact(payload: ContactPayload) {
    try {
      await rdStationApi.post('/platform/contacts', payload);

      return this.logger.log('RD Station - contact created', {
        email: payload.email,
      });
    } catch (error) {
      this.logger.error('RD Station - Error on create contact', {
        status: error?.status,
        message: error?.msg,
      });

      await this.contactBackupError(payload, error);
    }
  }

  async updateContact(payload: ContactPayload) {
    if (!payload.email) {
      this.logger.error('RD Station - Error on update contact', {
        message: 'Email is not provided',
      });

      return false;
    }

    try {
      const { data: contact }: { data: { email: string } } =
        await rdStationApi.get(`/platform/contacts/email:${payload.email}`);

      if (!contact?.email) {
        this.logger.error('RD Station - Error on update contact', {
          message: 'Not found contact',
          email: payload.email,
        });

        return false;
      }

      delete payload.email;

      await rdStationApi.patch(
        `/platform/contacts/email:${contact.email}`,
        payload,
      );

      this.logger.log('RD Station - contact updated', {
        email: contact.email,
      });

      return true;
    } catch (error) {
      this.logger.error('RD Station - Error on update contact', {
        error: error?.response?.data?.errors,
      });

      await this.contactBackupError(payload, error);

      return false;
    }
  }

  async getFirstAccessToken(code: string) {
    if (!code) {
      throw new BadRequestException({
        errorCode: ErrorCodes.VALIDATION,
        message: 'Erro ao tentar obter o primeiro access token.',
      });
    }

    const jsonBodyData = {
      code,
      client_id: this.configService.get(CONFIG.RD_STATION_CLIENT_ID),
      client_secret: this.configService.get(CONFIG.RD_STATION_CLIENT_SECRET),
    };

    try {
      const { data } = await rdStationApi.post('/auth/token', jsonBodyData);

      void this.cacheManager.set('access_data', JSON.stringify(data));

      this.logger.log('RD Station access_data save on cache');

      const accessData = JSON.stringify({
        ...data,
        ...jsonBodyData,
        date: new Date(),
      });

      return accessData;
    } catch (error) {
      this.logger.error(
        'RD Station getFirstAccessToken error',
        error.response.data?.msg,
      );

      throw new BadRequestException({
        errorCode: ErrorCodes.BAD_REQUEST,
        message: 'Erro ao tentar obter o primeiro access token.',
      });
    }
  }

  async contactBackupError(data: ContactPayload, error: any) {
    const cacheData: string = await this.cacheManager.get('contact_with_error');

    const errorData = { data, error: error?.response?.data?.errors };

    if (!cacheData) {
      return this.cacheManager.set('contact_with_error', [errorData]);
    }

    const newData = [...cacheData, errorData];

    void this.cacheManager.set('contact_with_error', newData);

    return this.logger.log('RD Station contact backup error', {
      email: data.email,
    });
  }
}
