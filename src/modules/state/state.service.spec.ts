import { Test, TestingModule } from '@nestjs/testing';
import { State, StateDocument } from '@schemas';
import { StateService } from './state.service';
import { getModelToken } from '@nestjs/mongoose';

describe('StateService', () => {
  let sut: StateService;
  const mockedFindAll = jest.fn(() => ({
    sort: jest.fn(() => ({
      exec: jest.fn(),
    })),
  }));

  beforeEach(async () => {
    const ModelMockedProvider = {
      provide: getModelToken(State.name),
      useValue: {
        findAll: mockedFindAll,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelMockedProvider, StateService],
      exports: [StateService],
    }).compile();

    sut = module.get<StateService>(StateService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('findAll', () => {
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
        .spyOn(sut, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await sut.findAll()).toBe(result);
    });

    it('should return an empty array', async () => {
      const result = [] as StateDocument[];

      jest
        .spyOn(sut, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await sut.findAll()).toBe(result);
    });
  });
});
