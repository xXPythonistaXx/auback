import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory } from '../authorization/casl-ability.factory';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';

describe('EmployerController', () => {
  let controller: EmployerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerController],
      providers: [
        {
          provide: EmployerService,
          useValue: {},
        },
        {
          provide: CaslAbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<EmployerController>(EmployerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
