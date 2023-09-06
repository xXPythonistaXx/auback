import { Test, TestingModule } from '@nestjs/testing';
import { LearnWorldsController } from './learn-worlds.controller';
import { LearnWorldsService } from './learn-worlds.service';
import { ITokenParsePayload } from '@shared/interfaces';

describe('LearnWorldsController', () => {
  let sut: LearnWorldsController;
  const mockedLearnWorldsService = {
    sso: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearnWorldsController],
      providers: [
        {
          provide: LearnWorldsService,
          useValue: mockedLearnWorldsService,
        },
      ],
    }).compile();

    sut = module.get<LearnWorldsController>(LearnWorldsController);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('sso', () => {
    it('should call LearnWorldsService.sso with the correct params', async () => {
      const userId = 'any_user_id';
      const req = {
        user: {
          _id: userId,
        } as ITokenParsePayload,
      };

      await sut.sso(req);

      expect(mockedLearnWorldsService.sso).toHaveBeenCalledWith(userId);
      expect(mockedLearnWorldsService.sso).toHaveBeenCalledTimes(1);
    });

    it('should return the correct value', async () => {
      const userId = 'any_user_id';
      const req = {
        user: {
          _id: userId,
        } as ITokenParsePayload,
      };

      const expected = 'any_value';

      mockedLearnWorldsService.sso.mockReturnValue(expected);

      const result = await sut.sso(req);

      expect(result).toBe(expected);
    });

    it('should throw if LearnWorldsService.sso throws', async () => {
      const userId = 'any_user_id';
      const req = {
        user: {
          _id: userId,
        } as ITokenParsePayload,
      };

      const expected = new Error('any_error');

      mockedLearnWorldsService.sso.mockRejectedValue(expected);

      const promise = sut.sso(req);

      await expect(promise).rejects.toThrow(expected);
    });
  });
});
