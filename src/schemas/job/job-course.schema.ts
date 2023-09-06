import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IJobCourse } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Course } from '../course.schema';

export type JobCourseDocument = JobCourse & Document;

@Schema()
export class JobCourse implements IJobCourse {
  _id: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Course.name, autopopulate: true })
  course: Course;
}

export const JobCourseSchema = SchemaFactory.createForClass(JobCourse);
