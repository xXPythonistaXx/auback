import { Test, TestingModule } from '@nestjs/testing';
import { RdStationController } from './rd-station.controller';
import { RdStationService } from './rd-station.service';

describe('RdStationController', () => {
  let controller: RdStationController;

  const RdStationServiceMocked = {
    getFirstAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RdStationController],
      providers: [
        {
          provide: RdStationService,
          useValue: RdStationServiceMocked,
        },
      ],
    }).compile();

    controller = module.get<RdStationController>(RdStationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call RdStationService.getFirstAccessToken', async () => {
    const code = '123';
    await controller.getFirstAccessToken({ code });
    expect(RdStationServiceMocked.getFirstAccessToken).toBeCalledWith(code);
  });
});
