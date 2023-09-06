import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CourseService } from './course.service';
import { getModelToken } from '@nestjs/mongoose';
import { Course } from '@schemas';
import { AcademicBackgroundType } from '@shared/enums';

describe('CourseService', () => {
  let service: CourseService;
  let courseModel;

  beforeEach(async () => {
    courseModel = {
      paginate: jest.fn(),
      insertMany: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getModelToken(Course.name),
          useValue: courseModel,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const course = {
        _id: '',
        name: 'Course A',
        codigo: '01',
        tipoCurso: AcademicBackgroundType.GRADUATION,
      };
      const createdCourse = await service.create(course);

      expect(createdCourse).toEqual(course);
      expect(courseModel.create).toHaveBeenCalledWith(course);
    });

    it('should throw an exception if course already exists', async () => {
      const existingCourse = {
        _id: '',
        name: 'Course A',
        codigo: '01',
        tipoCurso: AcademicBackgroundType.GRADUATION,
      };

      courseModel.findOne.mockResolvedValue(existingCourse);

      const course = {
        _id: '',
        name: 'Course A',
        codigo: '01',
        tipoCurso: AcademicBackgroundType.GRADUATION,
      };
      await expect(service.create(course)).rejects.toThrow(ConflictException);
    });
  });
});
