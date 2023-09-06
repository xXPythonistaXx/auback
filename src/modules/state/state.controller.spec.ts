import { Test, TestingModule } from '@nestjs/testing';
import { StateController } from './state.controller';
import { StateService } from './state.service';
import { StateDocument } from '@schemas';

describe('StateController', () => {
  let controller: StateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StateController],
      providers: [
        {
          provide: StateService,
          useValue: {
            getState: () => jest.fn(() => []),
          },
        },
      ],
    }).compile();

    controller = module.get<StateController>(StateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of states', async () => {
      const result = [
        {
          _id: 'any_id',
          cod: 11,
          name: 'Rondônia',
          abbreviated: 'RO',
        },
      ] as StateDocument[];

      jest
        .spyOn(controller, 'getAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await controller.getAll()).toBe(result);
    });

    it('should return an empty array', async () => {
      const result = [] as StateDocument[];

      jest
        .spyOn(controller, 'getAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await controller.getAll()).toBe(result);
    });
  });
});
