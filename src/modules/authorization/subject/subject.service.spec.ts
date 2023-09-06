import { Test, TestingModule } from '@nestjs/testing';
import { SubjectService } from './subject.service';
import { getModelToken } from '@nestjs/mongoose';
import { Subject } from '@schemas';

describe('SubjectService', () => {
  let service: SubjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: getModelToken(Subject.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
