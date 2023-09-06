import { Course } from '@schemas';
import { ICoursePayload } from './course.interface';

export interface IJobCourse {
  course: Course;
}

export interface IJobCourseUpdate extends Partial<Omit<IJobCourse, 'course'>> {
  _id: string;
  course: string;
}

export interface IJobCourseCreate extends Partial<Omit<IJobCourse, 'course'>> {
  course: string;
}

export interface IJobCoursePayload extends Omit<IJobCourse, 'course'> {
  _id: string;
  course: ICoursePayload;
}
