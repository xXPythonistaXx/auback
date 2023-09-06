import { Test, TestingModule } from '@nestjs/testing';
import { TalentDatabaseController } from './talent-database.controller';
import { TalentDatabaseService } from './talent-database.service';

describe('TalentDatabaseController', () => {
  let controller: TalentDatabaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TalentDatabaseController],
      providers: [
        {
          provide: TalentDatabaseService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TalentDatabaseController>(TalentDatabaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
