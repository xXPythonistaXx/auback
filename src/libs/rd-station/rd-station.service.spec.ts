import { Test, TestingModule } from '@nestjs/testing';
import { RdStationService } from './rd-station.service';
import { CACHE_MANAGER } from '@nestjs/common';
import * as nock from 'nock';
import { ConfigService } from '@nestjs/config';
import * as timekeeper from 'timekeeper';
import { PinoService } from 'src/modules/logger/pino.service';
import { ContactPayload } from '@shared/interfaces';

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('RdStationService', () => {
  let sut: RdStationService;

  const PinoServiceMocked = {
    error: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RdStationService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('any_value'),
          },
        },
        {
          provide: PinoService,
          useValue: PinoServiceMocked,
        },
      ],
    }).compile();

    sut = module.get<RdStationService>(RdStationService);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getFirstAccessToken', () => {
    describe('when don`t provide code params', () => {
      it('should throw BadRequestException', async () => {
        await expect(sut.getFirstAccessToken(null)).rejects.toThrow();
      });
    });

    describe('when request is successful', () => {
      const accessData = {
        access_token: 'any_access_token',
        refresh_token: 'any_refresh_token',
      };

      beforeAll(() => {
        nock('https://api.rd.services')
          .post('/auth/token')
          .reply(200, accessData);

        mockCacheManager.get.mockResolvedValue(null);

        timekeeper.freeze(new Date());
      });

      afterAll(() => {
        nock.cleanAll();
        timekeeper.reset();
      });

      it('should return access data', async () => {
        const code = 'any_code';

        const result = await sut.getFirstAccessToken(code);

        expect(result).toEqual(
          JSON.stringify({
            ...accessData,
            code,
            client_id: 'any_value',
            client_secret: 'any_value',
            date: new Date(),
          }),
        );
      });
    });

    describe('when request is not successful', () => {
      beforeAll(() => {
        nock('https://api.rd.services').post('/auth/token').reply(400, {
          message: 'any_message',
        });
      });

      afterAll(() => {
        nock.cleanAll();
      });

      it('should throw', async () => {
        const code = 'any_code';

        await expect(sut.getFirstAccessToken(code)).rejects.toThrow();
      });
    });
  });

  describe('refreshAccessToken', () => {
    const accessData = {
      refresh_token: 'any_refresh_token',
      client_id: 'any_value',
      client_secret: 'any_value',
    };

    describe('when don`t have access data', () => {
      beforeAll(() => {
        mockCacheManager.get.mockResolvedValue(null);
      });

      it('should return empty string', async () => {
        const config = await sut.refreshAccessToken();
        expect(config).toEqual('');
      });
    });

    describe('when don`t have refresh_token', () => {
      beforeAll(() => {
        mockCacheManager.get.mockResolvedValue(
          JSON.stringify({
            ...accessData,
            refresh_token: null,
          }),
        );
      });

      it('should return empty string', async () => {
        const config = await sut.refreshAccessToken();
        expect(config).toEqual('');
      });
    });
  });

  describe('postContact', () => {
    describe('when request is successful', () => {
      beforeAll(() => {
        nock('https://api.rd.services')
          .post('/platform/contacts')
          .reply(200, {});
      });

      afterAll(() => {
        nock.cleanAll();
      });

      it('should return true', async () => {
        await sut.postContact({} as ContactPayload);
        expect(PinoServiceMocked.log).toBeCalled();
      });
    });

    describe('when request is not successful', () => {
      beforeAll(() => {
        nock('https://api.rd.services')
          .post('/platform/contacts')
          .reply(400, {});
      });

      afterAll(() => {
        nock.cleanAll();
      });

      it('should return false', async () => {
        const spy = jest.spyOn(sut, 'contactBackupError');

        await sut.postContact({} as ContactPayload);

        expect(PinoServiceMocked.error).toBeCalled();
        expect(spy).toBeCalled();
      });
    });
  });

  describe('updateContact', () => {
    const validBodyData = { email: 'any_email@mail.com' };

    beforeAll(() => {
      jest.spyOn(sut, 'refreshAccessToken').mockImplementation(async () => {
        return Promise.resolve('any_value');
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('when request is successful', () => {
      beforeAll(() => {
        nock('https://api.rd.services')
          .get(`/platform/contacts/email:${validBodyData.email}`)
          .reply(200, validBodyData);

        nock('https://api.rd.services')
          .patch(`/platform/contacts/email:${validBodyData.email}`)
          .reply(200, validBodyData);
      });

      it('should return true', async () => {
        const result = await sut.updateContact({
          email: validBodyData.email,
        } as ContactPayload);

        expect(PinoServiceMocked.log).toHaveBeenCalledWith(
          'RD Station - contact updated',
          {
            email: validBodyData.email,
          },
        );
        expect(result).toBeTruthy();
      });
    });

    describe('when email is not provided on payload', () => {
      it('should display log and return false', async () => {
        const result = await sut.updateContact({} as any);

        expect(PinoServiceMocked.error).toHaveBeenCalledWith(
          'RD Station - Error on update contact',
          {
            message: 'Email is not provided',
          },
        );
        expect(result).toBeFalsy();
      });
    });

    describe('when request GET /platform/contacts not found any contact', () => {
      beforeAll(() => {
        nock('https://api.rd.services')
          .get(`/platform/contacts/email:any_email`)
          .reply(200, {});
      });

      it('should display log and return false', async () => {
        const result = await sut.updateContact({
          email: 'any_email',
        } as ContactPayload);

        expect(result).toBeFalsy();
        expect(PinoServiceMocked.error).toHaveBeenCalledWith(
          'RD Station - Error on update contact',
          {
            message: 'Not found contact',
            email: 'any_email',
          },
        );
      });
    });

    describe('when request GET /platform/contacts not found any contact and response 404', () => {
      const errorResponse = {
        response: {
          data: {
            errors: 'Not found contact',
          },
        },
      };

      beforeAll(() => {
        nock('https://api.rd.services')
          .get(`/platform/contacts/email:any_email`)
          .reply(404, errorResponse);
      });

      it('should display log and return false', async () => {
        const result = await sut.updateContact({
          email: 'any_email',
        } as ContactPayload);

        expect(result).toBeFalsy();
        expect(PinoServiceMocked.error).toHaveBeenCalled();
      });
    });
  });
});
