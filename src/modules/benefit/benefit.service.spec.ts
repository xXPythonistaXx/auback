import { Test, TestingModule } from '@nestjs/testing';
import { BenefitService } from './benefit.service';
import { getModelToken } from '@nestjs/mongoose';
import { Benefit } from '@schemas';

describe('BenefitService', () => {
  let sut: BenefitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BenefitService,
        {
          provide: getModelToken(Benefit.name),
          useValue: {},
        },
      ],
    }).compile();

    sut = module.get<BenefitService>(BenefitService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });
});
