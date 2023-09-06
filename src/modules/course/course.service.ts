import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from '@schemas';
import { PaginateOptions, defaultPaginateOptions } from '@shared/interfaces';
import { PaginateModel } from 'mongoose';

@Injectable()
export class CourseService {
  private readonly courses: Course[] = [];

  constructor(
    @InjectModel(Course.name)
    private courseModel: PaginateModel<CourseDocument>,
  ) {}

  async findAll(params?: PaginateOptions) {
    const { q, ...paginateOptions } = params;
    const options = { ...defaultPaginateOptions, ...paginateOptions };
    const search = q
      ? {
          $or: [{ name: { $regex: `(?i)(${q})` } }],
        }
      : {};
    return this.courseModel.paginate(search, options);
  }

  async createMany(courses: Course[]) {
    await this.checkDuplicateCourses(courses);
    await this.courseModel.insertMany(courses);
    return courses;
  }

  async create(course: Course) {
    await this.checkDuplicateCourse(course);
    await this.courseModel.create(course);
    return course;
  }

  private async checkDuplicateCourses(courses: Course[]) {
    const existingCourses = await this.courseModel.find({
      name: { $in: courses.map((course) => course.name) },
    });
    if (existingCourses.length > 0) {
      const duplicateCourseNames = existingCourses.map((course) => course.name);
      throw new ConflictException(
        `The following courses already exist: ${duplicateCourseNames.join(
          ', ',
        )}`,
      );
    }
  }

  private async checkDuplicateCourse(course: Course) {
    const existingCourse = await this.courseModel.findOne({
      name: course.name,
    });
    if (existingCourse) {
      throw new ConflictException(
        `The course '${course.name}' already exists.`,
      );
    }
  }
}
