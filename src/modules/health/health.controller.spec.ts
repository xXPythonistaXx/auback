import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import * as nock from 'nock';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, HttpModule],
      controllers: [HealthController],
      providers: [],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return 200', async () => {
      const response = await controller.check();
      expect(response.status).toBe('ok');
    });

    it('should return 500', () => {
      nock('https://docs.nestjs.com').get('/').reply(500);

      void expect(controller.check()).rejects.toThrow();
    });
  });
});
