const rdStationPayloadPurifierSpy = jest.fn();

jest.mock('@shared/helpers', () => ({
  rdStationPayloadPurifier: rdStationPayloadPurifierSpy,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { PinoService } from '../logger/pino.service';
import { RdStationService } from 'src/libs/rd-station/rd-station.service';
import { Events } from '@shared/enums';
import { LearnWorldsService } from '../../libs/learn-worlds/learn-worlds.service';

describe('EventsController', () => {
  let sut: EventsController;

  const PinoServiceMocked = {
    log: jest.fn(),
  };
  const RdStationServiceMocked = {
    postContact: jest.fn(),
    updateContact: jest.fn(),
  };

  const LearnWorldsServiceMocked = {
    syncUserProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: PinoService,
          useValue: PinoServiceMocked,
        },
        {
          provide: RdStationService,
          useValue: RdStationServiceMocked,
        },
        {
          provide: LearnWorldsService,
          useValue: LearnWorldsServiceMocked,
        },
      ],
    }).compile();

    sut = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('handleClientCreatedEvent', () => {
    const params = {
      user: {
        email: 'any_email@mail.com',
      },
    };

    it('should call PinoService.log', async () => {
      await sut.handleClientCreatedEvent(params);

      expect(PinoServiceMocked.log).toBeCalledWith(
        (expect as any).stringContaining(Events.CLIENT_CREATED),
      );
    });

    it('should call RdStationService.postContact', async () => {
      await sut.handleClientCreatedEvent(params);

      expect(RdStationServiceMocked.postContact).toBeCalled();
    });

    it('should call rdStationPayloadPurifier', async () => {
      await sut.handleClientCreatedEvent(params);

      expect(rdStationPayloadPurifierSpy).toBeCalledWith(params);
    });
  });

  describe('handleClientUpdatedEvent', () => {
    it('should call PinoService.log', async () => {
      await sut.handleClientUpdatedEvent({});

      expect(PinoServiceMocked.log).toBeCalledWith(
        (expect as any).stringContaining(Events.CLIENT_UPDATED),
      );
    });

    it('should call RdStationService.updateContact', async () => {
      await sut.handleClientUpdatedEvent({});

      expect(RdStationServiceMocked.updateContact).toBeCalled();
    });

    it('should call rdStationPayloadPurifier', async () => {
      await sut.handleClientUpdatedEvent({});

      expect(rdStationPayloadPurifierSpy).toBeCalledWith({});
    });
  });
});
