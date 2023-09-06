import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory } from '../authorization/casl-ability.factory';
import { JobController } from './job.controller';
import { JobService } from './job.service';

describe('JobController', () => {
  let controller: JobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        {
          provide: JobService,
          useValue: {},
        },
        {
          provide: CaslAbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<JobController>(JobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
